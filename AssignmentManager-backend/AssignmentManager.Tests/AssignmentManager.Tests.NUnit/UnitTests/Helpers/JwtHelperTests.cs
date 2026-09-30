using AssignmentManager.Helpers;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace AssignmentManager.Tests.NUnit.UnitTests.Helpers;

public sealed class JwtHelperTests
{
    private const string JwtKey = "A sufficiently long test JWT signing key 123!";

    [Test]
    public void GenerateToken_ContainsUserIdAndConfiguredIssuerAndAudience()
    {
        var configuration = CreateConfiguration();

        var token = JwtHelper.GenerateToken("user-123", configuration);
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.That(jwt.Claims.Single(claim => claim.Type == JwtRegisteredClaimNames.Sub).Value, Is.EqualTo("user-123"));
        Assert.That(jwt.Claims.Any(claim => claim.Type == JwtRegisteredClaimNames.Jti), Is.True);
        Assert.That(jwt.Issuer, Is.EqualTo("AssignManager.Tests"));
        Assert.That(jwt.Audiences, Does.Contain("AssignManager.TestUsers"));
    }

    [Test]
    public void GenerateToken_IsSignedAndValidForConfiguredKey()
    {
        var configuration = CreateConfiguration();
        var token = JwtHelper.GenerateToken("user-123", configuration);
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtKey)),
            ValidateIssuer = true,
            ValidIssuer = "AssignManager.Tests",
            ValidateAudience = true,
            ValidAudience = "AssignManager.TestUsers",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(5)
        };

        var principal = new JwtSecurityTokenHandler().ValidateToken(token, validationParameters, out _);

        Assert.That(principal.Identity?.IsAuthenticated, Is.True);
    }

    [Test]
    public void GenerateToken_WithoutSigningKey_ThrowsConfigurationError()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        var exception = Assert.Throws<InvalidOperationException>(() => JwtHelper.GenerateToken("user-123", configuration));

        Assert.That(exception!.Message, Does.Contain("JWT signing key is not configured"));
    }

    private static IConfiguration CreateConfiguration()
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = JwtKey,
                ["Jwt:Issuer"] = "AssignManager.Tests",
                ["Jwt:Audience"] = "AssignManager.TestUsers"
            })
            .Build();
    }
}
