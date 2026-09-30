using AssignmentManager.Models;

namespace AssignmentManager.Tests.NUnit.UnitTests.Models;

public sealed class ApiResponseTests
{
    [Test]
    public void Ok_CreatesSuccessResponseWithDataAndDefaultMessage()
    {
        var response = ApiResponse<string>.Ok("payload");

        Assert.That(response.Success, Is.True);
        Assert.That(response.Data, Is.EqualTo("payload"));
        Assert.That(response.Message, Is.EqualTo("Success"));
        Assert.That(response.Errors, Is.Null);
    }

    [Test]
    public void Fail_CreatesFailureResponseWithErrors()
    {
        var errors = new List<string> { "First error", "Second error" };

        var response = ApiResponse<string>.Fail("Validation failed", errors);

        Assert.That(response.Success, Is.False);
        Assert.That(response.Message, Is.EqualTo("Validation failed"));
        Assert.That(response.Errors, Is.EqualTo(errors));
        Assert.That(response.Data, Is.Null);
    }
}
