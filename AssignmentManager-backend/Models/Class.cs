namespace AssignmentManager.Models
{
    public class Class
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;       // e.g. CSE-3rd-Year-A
        public string? Code { get; set; }
        public string? AcademicYear { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}