using AssignmentManager.Controllers;
using AssignmentManager.Data;
using AssignmentManager.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AssignmentManager.Tests.NUnit.UnitTests.Controllers;

public sealed class AssignmentOwnershipTests
{
    [Test]
    public async Task GradeSubmission_OtherTeachersAssignment_IsForbidden()
    {
        await using var database = new TestDb();
        await using var context = database.CreateContext();
        var ownerId = Guid.NewGuid();
        var otherTeacherId = Guid.NewGuid();
        var (assignment, submission) = await AddSubmissionAsync(context, ownerId);
        var controller = CreateController(context, otherTeacherId);

        var result = await controller.GradeSubmission(submission.Id, new GradeDto { Marks = 50 });

        Assert.That(result, Is.TypeOf<ForbidResult>());
        Assert.That(context.Submissions.Single(item => item.Id == submission.Id).MarksObtained, Is.Null);
        Assert.That(context.Assignments.Single(item => item.Id == assignment.Id).TeacherId, Is.EqualTo(ownerId));
    }

    [Test]
    public async Task GradeSubmission_OwnAssignmentWithinMarkRange_UpdatesSubmission()
    {
        await using var database = new TestDb();
        await using var context = database.CreateContext();
        var teacherId = Guid.NewGuid();
        var (_, submission) = await AddSubmissionAsync(context, teacherId);
        var controller = CreateController(context, teacherId);

        var result = await controller.GradeSubmission(
            submission.Id,
            new GradeDto { Marks = 80, Feedback = "Good work" });

        Assert.That(result, Is.TypeOf<OkObjectResult>());
        Assert.That(submission.MarksObtained, Is.EqualTo(80));
        Assert.That(submission.Feedback, Is.EqualTo("Good work"));
        Assert.That(submission.Status, Is.EqualTo("Graded"));
    }

    [Test]
    public async Task UpdateAssignment_OtherTeachersAssignment_IsNotFound()
    {
        await using var database = new TestDb();
        await using var context = database.CreateContext();
        var ownerId = Guid.NewGuid();
        var (assignment, _) = await AddSubmissionAsync(context, ownerId);
        var controller = CreateController(context, Guid.NewGuid());

        var result = await controller.UpdateAssignment(
            assignment.Id,
            new UpdateAssignmentDto { Title = "Tampered title" });

        Assert.That(result, Is.TypeOf<NotFoundObjectResult>());
        Assert.That(assignment.Title, Is.EqualTo("Test assignment"));
    }

    [Test]
    public async Task UpdateAssignment_OwnAssignment_UpdatesRequestedFields()
    {
        await using var database = new TestDb();
        await using var context = database.CreateContext();
        var teacherId = Guid.NewGuid();
        var (assignment, _) = await AddSubmissionAsync(context, teacherId);
        var controller = CreateController(context, teacherId);

        var result = await controller.UpdateAssignment(
            assignment.Id,
            new UpdateAssignmentDto { Title = "Updated title", MaxMarks = 75 });

        Assert.That(result, Is.TypeOf<OkObjectResult>());
        Assert.That(assignment.Title, Is.EqualTo("Updated title"));
        Assert.That(assignment.MaxMarks, Is.EqualTo(75));
    }

    [Test]
    public async Task DeleteAssignment_OtherTeachersAssignment_IsNotFoundAndRemainsStored()
    {
        await using var database = new TestDb();
        await using var context = database.CreateContext();
        var (assignment, _) = await AddSubmissionAsync(context, Guid.NewGuid());
        var controller = CreateController(context, Guid.NewGuid());

        var result = await controller.DeleteAssignment(assignment.Id);

        Assert.That(result, Is.TypeOf<NotFoundObjectResult>());
        Assert.That(await context.Assignments.AnyAsync(item => item.Id == assignment.Id), Is.True);
    }

    [Test]
    public async Task GetSubmissionsOfAssignment_OtherTeachersAssignment_IsNotFound()
    {
        await using var database = new TestDb();
        await using var context = database.CreateContext();
        var (assignment, _) = await AddSubmissionAsync(context, Guid.NewGuid());
        var controller = CreateController(context, Guid.NewGuid());

        var result = await controller.GetSubmissionsOfAssignment(assignment.Id);

        Assert.That(result, Is.TypeOf<NotFoundObjectResult>());
    }

    [Test]
    public async Task ChangeSubmissionStatus_OtherTeachersSubmission_IsForbidden()
    {
        await using var database = new TestDb();
        await using var context = database.CreateContext();
        var (_, submission) = await AddSubmissionAsync(context, Guid.NewGuid());
        var controller = CreateController(context, Guid.NewGuid());

        var result = await controller.ChangeSubmissionStatus(
            submission.Id,
            new ChangeStatusDto { Status = "Late" });

        Assert.That(result, Is.TypeOf<ForbidResult>());
        Assert.That(submission.Status, Is.EqualTo("Submitted"));
    }

    [TestCase(-1)]
    [TestCase(101)]
    public async Task GradeSubmission_MarksOutsideAllowedRange_ReturnsBadRequest(int marks)
    {
        await using var database = new TestDb();
        await using var context = database.CreateContext();
        var teacherId = Guid.NewGuid();
        var (_, submission) = await AddSubmissionAsync(context, teacherId);
        var controller = CreateController(context, teacherId);

        var result = await controller.GradeSubmission(submission.Id, new GradeDto { Marks = marks });

        Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
        Assert.That(submission.MarksObtained, Is.Null);
    }

    private static TeacherController CreateController(ApplicationDbContext context, Guid teacherId)
    {
        var controller = new TeacherController(context);
        var identity = new ClaimsIdentity(
            new[] { new Claim(ClaimTypes.NameIdentifier, teacherId.ToString()) },
            "Test");
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
        };
        return controller;
    }

    private static async Task<(Assignment Assignment, Submission Submission)> AddSubmissionAsync(
        ApplicationDbContext context,
        Guid ownerId)
    {
        var owner = new User
        {
            Id = ownerId,
            Email = $"{ownerId:N}@example.com",
            FullName = "Assignment Owner"
        };
        var classEntity = new Class { Name = "Test Class", Code = "TST" };
        var subject = new Subject { Name = "Test Subject", Code = "TST" };
        var assignment = new Assignment
        {
            Teacher = owner,
            Class = classEntity,
            Subject = subject,
            Title = "Test assignment",
            MaxMarks = 100,
            Deadline = DateTime.UtcNow.AddDays(1)
        };
        var submission = new Submission
        {
            Assignment = assignment,
            Student = new User
            {
                Email = $"student-{Guid.NewGuid():N}@example.com",
                FullName = "Test Student"
            },
            Answer = "Answer"
        };

        context.Submissions.Add(submission);
        await context.SaveChangesAsync();
        return (assignment, submission);
    }
}
