using AssignmentManager.Data;
using AssignmentManager.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManager.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==================== 1. MANAGE USERS ====================
        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUsers([FromQuery] PaginationParams pagination)
        {
            var query = _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .AsQueryable();

            var totalCount = await query.CountAsync();

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.FullName,
                    u.Phone,
                    u.IsActive,
                    u.CreatedAt,
                    Roles = u.UserRoles.Select(ur => ur.Role.Name)
                })
                .ToListAsync();

            var result = new PagedResult<object>
            {
                Items = users.Cast<object>().ToList(),
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize,
                TotalCount = totalCount
            };

            return Ok(result);
        }

        [HttpPost("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Email already exists");

            var user = new User
            {
                Email = dto.Email,
                FullName = dto.FullName,
                Phone = dto.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == dto.RoleName);
            if (role == null)
                return BadRequest("Invalid role");

            _context.UserRoles.Add(new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "User created successfully", userId = user.Id });
        }

        [HttpPut("users/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound("User not found");

            user.FullName = dto.FullName ?? user.FullName;
            user.Phone = dto.Phone ?? user.Phone;
            user.IsActive = dto.IsActive ?? user.IsActive;

            await _context.SaveChangesAsync();
            return Ok(new { message = "User updated successfully" });
        }

        [HttpDelete("users/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeactivateUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound("User not found");

            user.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "User deactivated successfully" });
        }

        // ===== CHANGE ROLE =====
        [HttpPut("users/{id}/role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeUserRole(Guid id, [FromBody] ChangeRoleDto dto)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound("User not found");

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == dto.RoleName);
            if (role == null)
                return BadRequest("Invalid role. Use Admin, Teacher, or Student");

            _context.UserRoles.RemoveRange(user.UserRoles);

            _context.UserRoles.Add(new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Role changed to {dto.RoleName}" });
        }

        // ==================== 2. MANAGE CLASSES ====================
        [HttpGet("classes")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetClasses([FromQuery] PaginationParams pagination)
        {
            var query = _context.Classes.AsQueryable();
            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            var result = new PagedResult<Class>
            {
                Items = items,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize,
                TotalCount = totalCount
            };

            return Ok(result);
        }

        [HttpPost("classes")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateClass([FromBody] Class model)
        {
            _context.Classes.Add(model);
            await _context.SaveChangesAsync();
            return Ok(model);
        }

        [HttpPut("classes/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateClass(Guid id, [FromBody] Class model)
        {
            var existing = await _context.Classes.FindAsync(id);
            if (existing == null)
                return NotFound("Class not found");

            existing.Name = model.Name;
            existing.Code = model.Code;
            existing.AcademicYear = model.AcademicYear;
            existing.IsActive = model.IsActive;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // ==================== 3. MANAGE SUBJECTS ====================
        [HttpGet("subjects")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetSubjects([FromQuery] PaginationParams pagination)
        {
            var query = _context.Subjects.AsQueryable();
            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(s => s.CreatedAt)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            var result = new PagedResult<Subject>
            {
                Items = items,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize,
                TotalCount = totalCount
            };

            return Ok(result);
        }

        [HttpPost("subjects")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateSubject([FromBody] Subject model)
        {
            _context.Subjects.Add(model);
            await _context.SaveChangesAsync();
            return Ok(model);
        }

        [HttpPut("subjects/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSubject(Guid id, [FromBody] Subject model)
        {
            var existing = await _context.Subjects.FindAsync(id);
            if (existing == null)
                return NotFound("Subject not found");

            existing.Name = model.Name;
            existing.Code = model.Code;
            existing.Description = model.Description;
            existing.IsActive = model.IsActive;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // ==================== 4. TEACHER ASSIGNMENTS ====================
        [HttpPost("teacher-assignments")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignTeacher([FromBody] TeacherAssignmentDto dto)
        {
            var exists = await _context.TeacherAssignments.AnyAsync(t =>
                t.TeacherId == dto.TeacherId &&
                t.ClassId == dto.ClassId &&
                t.SubjectId == dto.SubjectId);

            if (exists)
                return BadRequest("Teacher is already assigned to this Class + Subject");

            var assignment = new TeacherAssignment
            {
                TeacherId = dto.TeacherId,
                ClassId = dto.ClassId,
                SubjectId = dto.SubjectId
            };

            _context.TeacherAssignments.Add(assignment);
            await _context.SaveChangesAsync();
            return Ok(assignment);
        }

        [HttpGet("teacher-assignments")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetTeacherAssignments()
        {
            var data = await _context.TeacherAssignments
                .Include(t => t.Teacher)
                .Include(t => t.Class)
                .Include(t => t.Subject)
                .Select(t => new
                {
                    t.Id,
                    TeacherName = t.Teacher.FullName,
                    ClassName = t.Class.Name,
                    SubjectName = t.Subject.Name,
                    t.AssignedAt
                })
                .ToListAsync();

            return Ok(data);
        }

        // ==================== 5. STUDENT ENROLLMENT ====================
        [HttpPost("enrollments")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EnrollStudent([FromBody] EnrollStudentDto dto)
        {
            var exists = await _context.StudentEnrollments
                .AnyAsync(e => e.StudentId == dto.StudentId && e.ClassId == dto.ClassId);

            if (exists)
                return BadRequest("Student is already enrolled in this class");

            var enrollment = new StudentEnrollment
            {
                StudentId = dto.StudentId,
                ClassId = dto.ClassId
            };

            _context.StudentEnrollments.Add(enrollment);
            await _context.SaveChangesAsync();
            return Ok(enrollment);
        }

        [HttpGet("enrollments")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetEnrollments()
        {
            var data = await _context.StudentEnrollments
                .Include(e => e.Student)
                .Include(e => e.Class)
                .Select(e => new
                {
                    e.Id,
                    StudentName = e.Student.FullName,
                    StudentEmail = e.Student.Email,
                    ClassName = e.Class.Name,
                    e.EnrolledAt
                })
                .ToListAsync();

            return Ok(data);
        }

        // ==================== 6. VIEW ALL ASSIGNMENTS & SUBMISSIONS ====================
        [HttpGet("assignments")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAssignments([FromQuery] PaginationParams pagination)
        {
            var query = _context.Assignments
                .Include(a => a.Teacher)
                .Include(a => a.Class)
                .Include(a => a.Subject)
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
                    a.IsPublished,
                    a.CreatedAt,
                    TeacherName = a.Teacher.FullName,
                    ClassName = a.Class.Name,
                    SubjectName = a.Subject.Name
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

        [HttpGet("submissions")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllSubmissions([FromQuery] PaginationParams pagination)
        {
            var query = _context.Submissions
                .Include(s => s.Student)
                .Include(s => s.Assignment)
                .AsQueryable();

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(s => s.SubmittedAt)
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .Select(s => new
                {
                    s.Id,
                    s.Answer,
                    s.SubmittedAt,
                    s.MarksObtained,
                    s.Feedback,
                    s.Status,
                    StudentName = s.Student.FullName,
                    AssignmentTitle = s.Assignment.Title
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

        // ==================== 7. APPLICATION SETTINGS ====================
        [HttpGet("settings")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetSettings()
        {
            return Ok(await _context.AppSettings.ToListAsync());
        }

        [HttpPost("settings")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpsertSetting([FromBody] AppSetting model)
        {
            var existing = await _context.AppSettings
                .FirstOrDefaultAsync(s => s.Key == model.Key);

            if (existing == null)
            {
                _context.AppSettings.Add(model);
            }
            else
            {
                existing.Value = model.Value;
                existing.Description = model.Description;
                existing.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(model);
        }
    }

    // ==================== DTOs ====================
    public class CreateUserDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string RoleName { get; set; } = "Student";
    }

    public class UpdateUserDto
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public bool? IsActive { get; set; }
    }

    public class TeacherAssignmentDto
    {
        public Guid TeacherId { get; set; }
        public Guid ClassId { get; set; }
        public Guid SubjectId { get; set; }
    }

    public class EnrollStudentDto
    {
        public Guid StudentId { get; set; }
        public Guid ClassId { get; set; }
    }

    public class ChangeRoleDto
    {
        public string RoleName { get; set; } = "Student";
    }
}