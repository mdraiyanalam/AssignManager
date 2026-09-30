using AssignmentManager.Models;

namespace AssignmentManager.Tests.NUnit.UnitTests.Models;

public sealed class PaginationParamsTests
{
    [Test]
    public void PageSize_DefaultsToTen()
    {
        Assert.That(new PaginationParams().PageSize, Is.EqualTo(10));
    }

    [Test]
    public void PageSize_LessThanOne_UsesDefault()
    {
        var pagination = new PaginationParams { PageSize = 0 };

        Assert.That(pagination.PageSize, Is.EqualTo(10));
    }

    [Test]
    public void PageSize_AboveMaximum_IsCappedAtFifty()
    {
        var pagination = new PaginationParams { PageSize = 100 };

        Assert.That(pagination.PageSize, Is.EqualTo(50));
    }
}
