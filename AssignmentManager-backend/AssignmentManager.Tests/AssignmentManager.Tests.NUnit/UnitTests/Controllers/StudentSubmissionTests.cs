using AssignmentManager.Controllers;
using AssignmentManager.Data;
using AssignmentManager.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace AssignmentManager.Tests.NUnit.UnitTests.Controllers;

public sealed class StudentSubmissionTests
{
    [Test]
    public async Task SubmitOrUpdate_UnenrolledStudent_IsForbidden()
    {
        await using var database = new TestDb();
        await using var context = database.CreateContext();
        var (student, assignment) = await SeedAssignmentAsync(context);
        var controller = CreateController(context, student.Id);

        var result = await controller.SubmitOrUpdate(new SubmitDto
        {
            AssignmentId = assignment.Id,
            Answer = "My answer"
        });

        Assert.That(result, Is.TypeOf<ForbidResult>());
        Assert.That(await context.Submissions.CountAsync(), Is.Zero);
    }

    [Test]
    public async Task SubmitOrUpdate_EnrolledStudent_CreatesThenUpdatesTheirSubmission()
    {
        await using var database = new TestDb();
        await using var context = database.CreateContext();
        var (student, assignment) = await SeedAssignmentAsync(context);
        context.StudentEnrollments.Add(new StudentEnrollment
        {
            StudentId = student.Id,
            Student = student,
            ClassId = assignment.ClassId
        });
        await context.SaveChangesAsync();
        var controller = CreateController(context, student.Id);

        var firstResult = await controller.SubmitOrUpdate(new SubmitDto
        {
            AssignmentId = assignment.Id,
            Answer = "First answer"
        });
        var secondResult = await controller.SubmitOrUpdate(new SubmitDto
        {
            AssignmentId = assignment.Id,
            Answer = "Updated answer"
        });

        var savedSubmission = await context.Submissions.SingleAsync();
        Assert.That(firstResult, Is.TypeOf<OkObjectResult>());
        Assert.That(secondResult, Is.TypeOf<OkObjectResult>());
        Assert.That(await context.Submissions.CountAsync(), Is.EqualTo(1));
        Assert.That(savedSubmission.Answer, Is.EqualTo("Updated answer"));
        Assert.That(savedSubmission.Status, Is.EqualTo("Submitted"));
    }

    [Test]
    public async Task SubmitOrUpdate_ExpiredAssignment_ReturnsBadRequest()
    {
        await using var database = new TestDb();
        await using var context = database.CreateContext();
        var (student, assignment) = await SeedAssignmentAsync(context, deadline: DateTime.UtcNow.AddDays(-1));
        context.StudentEnrollments.Add(new StudentEnrollment
        {
            StudentId = student.Id,
            Student = student,
            ClassId = assignment.ClassId
        });
        await context.SaveChangesAsync();
        var controller = CreateController(context, student.Id);

        var result = await controller.SubmitOrUpdate(new SubmitDto
        {
            AssignmentId = assignment.Id,
            Answer = "Late answer"
        });

        Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
        Assert.That(await context.Submissions.CountAsync(), Is.Zero);
    }

    [Test]
    public async Task SubmitOrUpdate_UnpublishedAssignment_ReturnsBadRequest()
    {
        await using var database = new TestDb();
        await using var context = database.CreateContext();
        var (student, assignment) = await SeedAssignmentAsync(context, isPublished: false);
        var controller = CreateController(context, student.Id);

        var result = await controller.SubmitOrUpdate(new SubmitDto
        {
            AssignmentId = assignment.Id,
            Answer = "Draft answer"
        });

        Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
        Assert.That(await context.Submissions.CountAsync(), Is.Zero);
    }

    [Test]
    public async Task GetMyAssignments_OnlyReturnsPublishedAssignmentsForEnrolledClasses()
    {
        await using var database = new TestDb();
        await using var context = database.CreateContext();
        var (student, enrolledAssignment) = await SeedAssignmentAsync(context);
        var enrolledClass = await context.Classes.SingleAsync(item => item.Id == enrolledAssignment.ClassId);
        var teacher = await context.Users.SingleAsync(item => item.Id == enrolledAssignment.TeacherId);
        var subject = await context.Subjects.SingleAsync(item => item.Id == enrolledAssignment.SubjectId);
        var hiddenAssignment = new Assignment
        {
            Title = "Unpublished assignment",
            Teacher = teacher,
            Class = enrolledClass,
            Subject = subject,
            MaxMarks = 100,
            Deadline = DateTime.UtcNow.AddDays(1),
            IsPublished = false
        };
        var otherClassAssignment = new Assignment
        {
            Title = "Not enrolled assignment",
            Teacher = teacher,
            Class = new Class { Name = "Other Class", Code = "OTHER" },
            Subject = subject,
            MaxMarks = 100,
            Deadline = DateTime.UtcNow.AddDays(1)
        };
        context.Assignments.AddRange(hiddenAssignment, otherClassAssignment);
        context.StudentEnrollments.Add(new StudentEnrollment
        {
            StudentId = student.Id,
            Student = student,
            ClassId = enrolledAssignment.ClassId
        });
        await context.SaveChangesAsync();

        var result = await CreateController(context, student.Id).GetMyAssignments(new PaginationParams());

        Assert.That(result, Is.TypeOf<OkObjectResult>());
        var json = JsonSerializer.Serialize(((OkObjectResult)result).Value);
        Assert.That(json, Does.Contain("Published assignment"));
        Assert.That(json, Does.Not.Contain("Unpublished assignment"));
        Assert.That(json, Does.Not.Contain("Not enrolled assignment"));
    }

    [Test]
    public async Task GetMySubmissions_OnlyReturnsCurrentStudentsSubmissions()
    {
        await using var database = new TestDb();
        await using var context = database.CreateContext();
        var (student, assignment) = await SeedAssignmentAsync(context);
        var otherStudent = new User
        {
            Email = "other-student@example.com",
            FullName = "Other Student"
        };
        context.Submissions.AddRange(
            new Submission
            {
                Student = student,
                Assignment = assignment,
                Answer = "Current student answer"
            },
            new Submission
            {
                Student = otherStudent,
                Assignment = assignment,
                Answer = "Other student's answer"
            });
        await context.SaveChangesAsync();

        var result = await CreateController(context, student.Id).GetMySubmissions();

        Assert.That(result, Is.TypeOf<OkObjectResult>());
        var json = JsonSerializer.Serialize(((OkObjectResult)result).Value);
        Assert.That(json, Does.Contain("Current student answer"));
        Assert.That(json, Does.Not.Contain("Other student's answer"));
    }

    private static StudentController CreateController(ApplicationDbContext context, Guid studentId)
    {
        var identity = new ClaimsIdentity(
            new[] { new Claim(ClaimTypes.NameIdentifier, studentId.ToString()) },
            "Test");
        var controller = new StudentController(context)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
            }
        };
        return controller;
    }

    private static async Task<(User Student, Assignment Assignment)> SeedAssignmentAsync(
        ApplicationDbContext context,
        bool isPublished = true,
        DateTime? deadline = null)
    {
        var student = new User
        {
            Email = "student@example.com",
            FullName = "Test Student"
        };
        var assignment = new Assignment
        {
            Title = "Published assignment",
            Teacher = new User
            {
                Email = "teacher@example.com",
                FullName = "Test Teacher"
            },
            Class = new Class { Name = "Enrolled Class", Code = "ENR" },
            Subject = new Subject { Name = "Test Subject", Code = "TST" },
            MaxMarks = 100,
            Deadline = deadline ?? DateTime.UtcNow.AddDays(1),
            IsPublished = isPublished
        };
        context.Users.Add(student);
        context.Assignments.Add(assignment);
        await context.SaveChangesAsync();
        return (student, assignment);
    }
}
