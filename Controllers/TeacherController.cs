using AssignmentManager.Data;
using AssignmentManager.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AssignmentManager.Controllers
{
    [Route("api/teacher")]
    [ApiController]
    [Authorize(Roles = "Teacher")]
    public class TeacherController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TeacherController(ApplicationDbContext context)
        {
            _context = context;
        }

        private Guid GetCurrentUserId()
        {
            return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        // ==================== CLASSES & SUBJECTS (for dropdowns) ====================
        [HttpGet("classes")]
        public async Task<IActionResult> GetClasses()
        {
            var items = await _context.Classes
                .Where(c => c.IsActive)
                .OrderBy(c => c.Name)
                .Select(c => new { c.Id, c.Name, c.Code })
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("subjects")]
        public async Task<IActionResult> GetSubjects()
        {
            var items = await _context.Subjects
                .Where(s => s.IsActive)
                .OrderBy(s => s.Name)
                .Select(s => new { s.Id, s.Name, s.Code })
                .ToListAsync();

            return Ok(items);
        }

        // ==================== CREATE ASSIGNMENT ====================
        [HttpPost("assignments")]
        public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentDto dto)
        {
            var assignment = new Assignment
            {
                Title = dto.Title,
                Description = dto.Description,
                Deadline = dto.Deadline,
                MaxMarks = dto.MaxMarks,
                IsPublished = dto.IsPublished,
                TeacherId = GetCurrentUserId(),
                ClassId = dto.ClassId,
                SubjectId = dto.SubjectId
            };

            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync();
            return Ok(assignment);
        }

        // ==================== GET MY ASSIGNMENTS ====================
        [HttpGet("assignments")]
        public async Task<IActionResult> GetMyAssignments([FromQuery] PaginationParams pagination)
        {
            var teacherId = GetCurrentUserId();

            var query = _context.Assignments
                .Where(a => a.TeacherId == teacherId)
                .Include(a => a.Class)
                .Include(a => a.Subject)
                .AsQueryable();

            var totalCount = await query.CountAsync();

            var list = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .Select(a => new
                {
                    a.Id,
                    a.Title,
                    a.Description,
                    a.Deadline,
                    a.MaxMarks,
                    a.IsPublished,
                    a.CreatedAt,
                    ClassName = a.Class.Name,
                    SubjectName = a.Subject.Name
                })
                .ToListAsync();

            var result = new PagedResult<object>
            {
                Items = list.Cast<object>().ToList(),
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize,
                TotalCount = totalCount
            };

            return Ok(result);
        }

        // ==================== UPDATE ASSIGNMENT ====================
        [HttpPut("assignments/{id}")]
        public async Task<IActionResult> UpdateAssignment(Guid id, [FromBody] UpdateAssignmentDto dto)
        {
            var teacherId = GetCurrentUserId();

            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == id && a.TeacherId == teacherId);

            if (assignment == null)
                return NotFound("Assignment not found or you don't have permission");

            assignment.Title = dto.Title ?? assignment.Title;
            assignment.Description = dto.Description ?? assignment.Description;
            assignment.Deadline = dto.Deadline ?? assignment.Deadline;
            assignment.MaxMarks = dto.MaxMarks ?? assignment.MaxMarks;
            assignment.IsPublished = dto.IsPublished ?? assignment.IsPublished;

            if (dto.ClassId.HasValue) assignment.ClassId = dto.ClassId.Value;
            if (dto.SubjectId.HasValue) assignment.SubjectId = dto.SubjectId.Value;

            await _context.SaveChangesAsync();
            return Ok(assignment);
        }

        // ==================== DELETE ASSIGNMENT ====================
        [HttpDelete("assignments/{id}")]
        public async Task<IActionResult> DeleteAssignment(Guid id)
        {
            var teacherId = GetCurrentUserId();

            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == id && a.TeacherId == teacherId);

            if (assignment == null)
                return NotFound("Assignment not found or you don't have permission");

            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Assignment deleted successfully" });
        }

        // ==================== VIEW SUBMISSIONS ====================
        [HttpGet("assignments/{assignmentId}/submissions")]
        public async Task<IActionResult> GetSubmissionsOfAssignment(Guid assignmentId)
        {
            var teacherId = GetCurrentUserId();

            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == assignmentId && a.TeacherId == teacherId);

            if (assignment == null)
                return NotFound("Assignment not found or you don't have permission");

            var submissions = await _context.Submissions
                .Where(s => s.AssignmentId == assignmentId)
                .Include(s => s.Student)
                .Select(s => new
                {
                    s.Id,
                    StudentName = s.Student.FullName,
                    StudentEmail = s.Student.Email,
                    s.Answer,
                    s.SubmittedAt,
                    s.MarksObtained,
                    s.Feedback,
                    s.Status
                })
                .ToListAsync();

            return Ok(submissions);
        }

        // ==================== GRADE SUBMISSION ====================
        [HttpPut("submissions/{id}/grade")]
        public async Task<IActionResult> GradeSubmission(Guid id, [FromBody] GradeDto dto)
        {
            var teacherId = GetCurrentUserId();

            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (submission == null)
                return NotFound("Submission not found");

            if (submission.Assignment.TeacherId != teacherId)
                return Forbid("You can only grade submissions of your own assignments");

            submission.MarksObtained = dto.Marks;
            submission.Feedback = dto.Feedback;
            submission.Status = dto.Status ?? "Graded";

            await _context.SaveChangesAsync();
            return Ok(submission);
        }

        // ==================== CHANGE STATUS ====================
        [HttpPut("submissions/{id}/status")]
        public async Task<IActionResult> ChangeSubmissionStatus(Guid id, [FromBody] ChangeStatusDto dto)
        {
            var teacherId = GetCurrentUserId();

            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (submission == null)
                return NotFound("Submission not found");

            if (submission.Assignment.TeacherId != teacherId)
                return Forbid("You can only change status of your own assignments' submissions");

            submission.Status = dto.Status;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Status updated", status = submission.Status });
        }
    }

    // ==================== DTOs ====================
    public class CreateAssignmentDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime Deadline { get; set; }
        public int MaxMarks { get; set; }
        public bool IsPublished { get; set; } = false;
        public Guid ClassId { get; set; }
        public Guid SubjectId { get; set; }
    }

    public class UpdateAssignmentDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? Deadline { get; set; }
        public int? MaxMarks { get; set; }
        public bool? IsPublished { get; set; }
        public Guid? ClassId { get; set; }
        public Guid? SubjectId { get; set; }
    }

    public class GradeDto
    {
        public int Marks { get; set; }
        public string? Feedback { get; set; }
        public string? Status { get; set; } = "Graded";
    }

    public class ChangeStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}