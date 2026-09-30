using System.Net;
using System.Net.Http.Headers;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.EntityFrameworkCore;
using AssignmentManager.Data;
using AssignmentManager.Models;
using NUnit.Framework;
using System.Net.Http.Json;

namespace AssignmentManager.Tests.NUnit.UnitTests.Controllers;

public sealed class AdminAuthorizationTests
{
    [TestCase("POST", "/api/admin/users")]
    [TestCase("GET", "/api/admin/users")]
    [TestCase("PUT", "/api/admin/users/00000000-0000-0000-0000-000000000001")]
    [TestCase("DELETE", "/api/admin/users/00000000-0000-0000-0000-000000000001")]
    [TestCase("PUT", "/api/admin/users/00000000-0000-0000-0000-000000000001/role")]
    [TestCase("POST", "/api/admin/classes")]
    [TestCase("GET", "/api/admin/classes")]
    [TestCase("PUT", "/api/admin/classes/00000000-0000-0000-0000-000000000001")]
    [TestCase("POST", "/api/admin/subjects")]
    [TestCase("GET", "/api/admin/subjects")]
    [TestCase("PUT", "/api/admin/subjects/00000000-0000-0000-0000-000000000001")]
    [TestCase("POST", "/api/admin/teacher-assignments")]
    [TestCase("GET", "/api/admin/teacher-assignments")]
    [TestCase("POST", "/api/admin/enrollments")]
    [TestCase("GET", "/api/admin/enrollments")]
    [TestCase("GET", "/api/admin/assignments")]
    [TestCase("GET", "/api/admin/submissions")]
    [TestCase("GET", "/api/admin/settings")]
    [TestCase("POST", "/api/admin/settings")]
    public async Task AdminEndpoint_RejectsStudentRole(string method, string path)
    {
        await using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.RoleHeader, "Student");

        using var request = new HttpRequestMessage(new HttpMethod(method), path)
        {
            Content = new StringContent("{}", Encoding.UTF8, "application/json")
        };

        using var response = await client.SendAsync(request);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Forbidden));
    }

    [TestCase("/api/admin/classes")]
    [TestCase("/api/admin/subjects")]
    public async Task TeacherCanReadSharedAdminCatalogs(string path)
    {
        await using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.RoleHeader, "Teacher");

        using var response = await client.GetAsync(path);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
    }

    [Test]
    public async Task TeacherAssignmentEndpoint_UsesRegisteredFluentValidation()
    {
        await using var factory = new TestApplicationFactory();
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.RoleHeader, "Teacher");
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        using var response = await client.PostAsync(
            "/api/teacher/assignments",
            new StringContent(
                """{"title":"","deadline":"2099-01-01T00:00:00Z","maxMarks":100,"classId":"00000000-0000-0000-0000-000000000001","subjectId":"00000000-0000-0000-0000-000000000002"}""",
                Encoding.UTF8,
                "application/json"));

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Login_WithWrongPassword_IsUnauthorized()
    {
        await using var factory = new TestApplicationFactory();
        await SeedUserAsync(factory, isActive: true);
        using var client = factory.CreateClient();

        using var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "test-user@example.com",
            Password = "wrong-password"
        });

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Unauthorized));
    }

    [Test]
    public async Task Login_WithInactiveUser_IsUnauthorized()
    {
        await using var factory = new TestApplicationFactory();
        await SeedUserAsync(factory, isActive: false);
        using var client = factory.CreateClient();

        using var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            Email = "test-user@example.com",
            Password = "correct-password"
        });

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Unauthorized));
    }

    private static async Task SeedUserAsync(TestApplicationFactory factory, bool isActive)
    {
        using var scope = factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        context.Users.Add(new User
        {
            Email = "test-user@example.com",
            FullName = "Test User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("correct-password"),
            IsActive = isActive
        });
        await context.SaveChangesAsync();
    }

    private sealed class TestApplicationFactory : WebApplicationFactory<Program>
    {
        private readonly string _databaseName = $"api-tests-{Guid.NewGuid():N}";

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");
            builder.ConfigureTestServices(services =>
            {
                services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
                services.RemoveAll<ApplicationDbContext>();
                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseInMemoryDatabase(_databaseName));
                services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = TestAuthenticationHandler.SchemeName;
                    options.DefaultChallengeScheme = TestAuthenticationHandler.SchemeName;
                    options.DefaultForbidScheme = TestAuthenticationHandler.SchemeName;
                }).AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions,
                    TestAuthenticationHandler>(TestAuthenticationHandler.SchemeName, _ => { });
            });
        }
    }
}

internal sealed class TestAuthenticationHandler(
    Microsoft.Extensions.Options.IOptionsMonitor<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions> options,
    Microsoft.Extensions.Logging.ILoggerFactory logger,
    System.Text.Encodings.Web.UrlEncoder encoder)
    : Microsoft.AspNetCore.Authentication.AuthenticationHandler<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions>(
        options,
        logger,
        encoder)
{
    public const string SchemeName = "Test";
    public const string RoleHeader = "X-Test-Role";

    protected override Task<Microsoft.AspNetCore.Authentication.AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(RoleHeader, out var roleHeader))
        {
            return Task.FromResult(Microsoft.AspNetCore.Authentication.AuthenticateResult.NoResult());
        }

        var claims = new[]
        {
            new System.Security.Claims.Claim(
                System.Security.Claims.ClaimTypes.NameIdentifier,
                Guid.Parse("00000000-0000-0000-0000-000000000101").ToString()),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, roleHeader.ToString())
        };
        var identity = new System.Security.Claims.ClaimsIdentity(claims, SchemeName);
        var principal = new System.Security.Claims.ClaimsPrincipal(identity);
        var ticket = new Microsoft.AspNetCore.Authentication.AuthenticationTicket(principal, SchemeName);
        return Task.FromResult(Microsoft.AspNetCore.Authentication.AuthenticateResult.Success(ticket));
    }
}
