using Microsoft.AspNetCore.Mvc;

namespace AssignmentManager.Models
{
    public class PaginationParams
    {
        private const int MaxPageSize = 50;
        // If someone asks for pageSize=9999, you cap at 50. Protects the database.
        // Used as [FromQuery]
        // PaginationParams pagination.
        private int _pageSize = 10;

        public int PageNumber { get; set; } = 1;

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
        }
    }
}

/*
 Note - 01: What if I don’t use _pageSize = 10, or I need more than 10?
    _pageSize = 10 is only the default when the client does not send pageSize.

    Client sends ?pageNumber=1 → page size becomes 10
    Client sends ?pageSize=20 → page size becomes 20
    Client sends ?pageSize=9999 → still 50 (the cap)

    You do not need to change code to show more than 10 items.
    The client just passes a bigger pageSize (up to 50).
    If you want a different default or cap, the below two code only changes:
            private const int MaxPageSize = 100; // allow up to 100
            private int _pageSize = 20;          // default 20 instead of 10
 */

/*
 Note - 02: How does capping at 50 protect the database?
    If there is no cap, someone can call:
    GET /api/admin/users?pageSize=1000000
    Then SQL would try to load 1,000,000 rows → slow API, high memory, possible crash.
    The setter:
        ASP.NET: set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
    means: if value > 50, use 50. Otherwise use value.
 */

/*
 Note - 03: What is [FromQuery]?
   [FromQuery] tells ASP.NET: read this object from the URL query string.
    GET /api/teacher/assignments?pageNumber=2&pageSize=10
    In the controller:
    public async Task<IActionResult> GetMyAssignments([FromQuery] PaginationParams pagination)
    
    ASP.NET maps:
    - pageNumber=2 → pagination.PageNumber
    - pageSize=10 → pagination.PageSize (goes through the setter)

    Names must match (case-insensitive).

    It is in two controllers (same method name, different meaning).
    File: 1) TeacherController.cs Line 91 GET /api/teacher/assignments That teacher’s own assignments
    2) StudentController.cs 33 GET /api/student/assignments Published assignments for the student’s enrolled classes
 */