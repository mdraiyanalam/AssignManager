using AssignmentManager.Controllers;
using AssignmentManager.Validators;

namespace AssignmentManager.Tests.NUnit.UnitTests.Validators;

public sealed class CreateAssignmentDtoValidatorTests
{
    private readonly CreateAssignmentDtoValidator _validator = new();

    [Test]
    public void Validate_WithEmptyTitle_IsInvalid()
    {
        var result = _validator.Validate(ValidAssignment(title: string.Empty));

        AssertInvalidProperty(result, nameof(CreateAssignmentDto.Title));
    }

    [Test]
    public void Validate_WithTitleLongerThan200Characters_IsInvalid()
    {
        var result = _validator.Validate(ValidAssignment(title: new string('a', 201)));

        AssertInvalidProperty(result, nameof(CreateAssignmentDto.Title));
    }

    [Test]
    public void Validate_WithMaxMarksZero_IsInvalid()
    {
        var result = _validator.Validate(ValidAssignment(maxMarks: 0));

        AssertInvalidProperty(result, nameof(CreateAssignmentDto.MaxMarks));
    }

    [Test]
    public void Validate_WithPastDeadline_IsInvalid()
    {
        var result = _validator.Validate(ValidAssignment(deadline: DateTime.UtcNow.AddDays(-1)));

        AssertInvalidProperty(result, nameof(CreateAssignmentDto.Deadline));
    }

    [Test]
    public void Validate_WithEmptyClassId_IsInvalid()
    {
        var result = _validator.Validate(ValidAssignment(classId: Guid.Empty));

        AssertInvalidProperty(result, nameof(CreateAssignmentDto.ClassId));
    }

    [Test]
    public void Validate_WithEmptySubjectId_IsInvalid()
    {
        var result = _validator.Validate(ValidAssignment(subjectId: Guid.Empty));

        AssertInvalidProperty(result, nameof(CreateAssignmentDto.SubjectId));
    }

    private static CreateAssignmentDto ValidAssignment(
        string title = "Assignment",
        int maxMarks = 100,
        DateTime? deadline = null,
        Guid? classId = null,
        Guid? subjectId = null)
    {
        return new CreateAssignmentDto
        {
            Title = title,
            MaxMarks = maxMarks,
            Deadline = deadline ?? DateTime.UtcNow.AddDays(7),
            ClassId = classId ?? Guid.NewGuid(),
            SubjectId = subjectId ?? Guid.NewGuid()
        };
    }

    private static void AssertInvalidProperty(FluentValidation.Results.ValidationResult result, string property)
    {
        Assert.That(result.IsValid, Is.False);
        Assert.That(result.Errors, Has.Some.Matches<FluentValidation.Results.ValidationFailure>(
            error => error.PropertyName == property));
    }
}
