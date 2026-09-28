namespace AssignmentManager.Models
{
    public class Submission
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Answer { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public int? MarksObtained { get; set; }
        // int? because marks don’t exist until graded.
        public string? Feedback { get; set; }
        public string Status { get; set; } = "Submitted"; // Submitted, Graded, Late, etc.
        // There is something called 'enum'. change the line 11 to enum for  Submitted, Graded, Late or others

        public Guid AssignmentId { get; set; }
        public Assignment Assignment { get; set; } = null!;

        public Guid StudentId { get; set; }
        public User Student { get; set; } = null!;
        // These two lines (17 and 18) are a pair: One row = one student + one assignment
    }
}