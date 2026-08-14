using AssignmentManager.Data;
using AssignmentManager.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AssignmentManager.Controllers
{
    [Route("api/student")]
    [ApiController]
    [Authorize(Roles = "Student")]
    public class StudentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StudentController(ApplicationDbContext context)
        {
            _context = context;
        }

        private Guid GetCurrentUserId()
        {
            return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        // ==================== VIEW ASSIGNMENTS OF MY ENROLLED CLASSES (Paginated) ====================
        [HttpGet("assignments")]
        public async Task<IActionResult> GetMyAssignments([FromQuery] PaginationParams pagination)
        {
            var studentId = GetCurrentUserId();

            var enrolledClassIds = await _context.StudentEnrollments
                .Where(e => e.StudentId == studentId)
                .Select(e => e.ClassId)
                .ToListAsync();

            var query = _context.Assignments
                .Where(a => a.IsPublished && enrolledClassIds.Contains(a.ClassId))
                .Include(a => a.Class)
                .Include(a => a.Subject)
                .Include(a => a.Teacher)
                .AsQueryable();

            var totalCount = await query.CountAsync();

            var items = await query
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
                    a.CreatedAt,
                    ClassName = a.Class.Name,
                    SubjectName = a.Subject.Name,
                    TeacherName = a.Teacher.FullName
                })
                .ToListAsync();

            var result = new PagedResult<object>
            {
                Items = items.Cast<object>().ToList(),
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize,
                TotalCount = totalCount
            };

            return Ok(result);
        }

        // ==================== SUBMIT / UPDATE SUBMISSION ====================
        [HttpPost("submissions")]
        public async Task<IActionResult> SubmitOrUpdate([FromBody] SubmitDto dto)
        {
            var studentId = GetCurrentUserId();

            var assignment = await _context.Assignments.FindAsync(dto.AssignmentId);
            if (assignment == null || !assignment.IsPublished)
                return BadRequest("Assignment not found or not published");

            var isEnrolled = await _context.StudentEnrollments
                .AnyAsync(e => e.StudentId == studentId && e.ClassId == assignment.ClassId);

            if (!isEnrolled)
                return Forbid("You are not enrolled in the class of this assignment");

            if (DateTime.UtcNow > assignment.Deadline)
                return BadRequest("Deadline has passed. You cannot submit or update.");

            var existing = await _context.Submissions
                .FirstOrDefaultAsync(s => s.AssignmentId == dto.AssignmentId && s.StudentId == studentId);

            if (existing != null)
            {
                existing.Answer = dto.Answer;
                existing.SubmittedAt = DateTime.UtcNow;
                existing.Status = "Submitted";
            }
            else
            {
                var submission = new Submission
                {
                    AssignmentId = dto.AssignmentId,
                    StudentId = studentId,
                    Answer = dto.Answer,
                    Status = "Submitted"
                };
                _context.Submissions.Add(submission);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Submission saved successfully" });
        }

        // ==================== VIEW MY SUBMISSIONS ====================
        [HttpGet("submissions")]
        public async Task<IActionResult> GetMySubmissions()
        {
            var studentId = GetCurrentUserId();

            var list = await _context.Submissions
                .Where(s => s.StudentId == studentId)
                .Include(s => s.Assignment)
                .Select(s => new
                {
                    s.Id,
                    s.Answer,
                    s.SubmittedAt,
                    s.MarksObtained,
                    s.Feedback,
                    s.Status,
                    AssignmentTitle = s.Assignment.Title,
                    Deadline = s.Assignment.Deadline,
                    MaxMarks = s.Assignment.MaxMarks
                })
                .ToListAsync();

            return Ok(list);
        }
    }

    public class SubmitDto
    {
        public Guid AssignmentId { get; set; }
        public string Answer { get; set; } = string.Empty;
    }
}