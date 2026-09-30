using AssignmentManager.Data;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManager.Tests.NUnit;

public sealed class TestDb : IAsyncDisposable
{
    private readonly string _databaseName = $"assignment-manager-tests-{Guid.NewGuid():N}";

    public ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(_databaseName)
            .Options;

        return new ApplicationDbContext(options);
    }

    public async ValueTask DisposeAsync()
    {
        await using var context = CreateContext();
        await context.Database.EnsureDeletedAsync();
    }
}
