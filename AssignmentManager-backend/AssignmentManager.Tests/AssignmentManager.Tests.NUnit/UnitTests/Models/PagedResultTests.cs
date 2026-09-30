using AssignmentManager.Models;

namespace AssignmentManager.Tests.NUnit.UnitTests.Models;

public sealed class PagedResultTests
{
    [Test]
    public void TotalPages_RoundsUpPartialPage()
    {
        var result = new PagedResult<int> { PageNumber = 2, PageSize = 10, TotalCount = 21 };

        Assert.That(result.TotalPages, Is.EqualTo(3));
        Assert.That(result.HasPrevious, Is.True);
        Assert.That(result.HasNext, Is.True);
    }

    [Test]
    public void HasNext_IsFalseOnLastPage()
    {
        var result = new PagedResult<int> { PageNumber = 2, PageSize = 10, TotalCount = 20 };

        Assert.That(result.HasNext, Is.False);
    }
}
