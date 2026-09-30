using AssignmentManager.Data;
using AssignmentManager.Models;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManager.Tests.NUnit.UnitTests.Data;

public sealed class SeederTests
{
    [Test]
    public async Task SeedAsync_CreatesRolesAndPasswordHashesForAllSeedUsers()
    {
        await using var database = new TestDb();
        await using var context = database.CreateContext();

        await Seeder.SeedAsync(context);

        Assert.That(await context.Roles.Select(role => role.Name).ToListAsync(),
            Is.EquivalentTo(new[] { "Admin", "Teacher", "Student" }));
        AssertSeededUser(context, "admin@assignmanager.com", "Admin@123", "Admin");
        AssertSeededUser(context, "teacher@assignmanager.com", "Teacher@123", "Teacher");
        AssertSeededUser(context, "student@assignmanager.com", "Student@123", "Student");
    }

    [Test]
    public async Task SeedAsync_CanRunMoreThanOnceWithoutDuplicatingSeedData()
    {
        await using var database = new TestDb();
        await using var context = database.CreateContext();

        await Seeder.SeedAsync(context);
        await Seeder.SeedAsync(context);

        Assert.That(await context.Roles.CountAsync(), Is.EqualTo(3));
        Assert.That(await context.Users.CountAsync(), Is.EqualTo(3));
        Assert.That(await context.UserRoles.CountAsync(), Is.EqualTo(3));
    }

    private static void AssertSeededUser(ApplicationDbContext context, string email, string password, string role)
    {
        var user = context.Users.Single(item => item.Email == email);

        Assert.That(BCrypt.Net.BCrypt.Verify(password, user.PasswordHash), Is.True);
        Assert.That(context.UserRoles.Include(userRole => userRole.Role)
            .Any(userRole => userRole.UserId == user.Id && userRole.Role.Name == role), Is.True);
    }
}
