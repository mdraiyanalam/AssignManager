namespace AssignmentManager.Models
{
    public class Submission
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Answer { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public int? MarksObtained { get; set; }
        public string? Feedback { get; set; }
        public string Status { get; set; } = "Submitted"; // Submitted, Graded, Late, etc.

        public Guid AssignmentId { get; set; }
        public Assignment Assignment { get; set; } = null!;

        public Guid StudentId { get; set; }
        public User Student { get; set; } = null!;
    }
}