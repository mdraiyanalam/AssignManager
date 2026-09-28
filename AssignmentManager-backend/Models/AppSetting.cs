namespace AssignmentManager.Models
{
    public class AppSetting
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        // Primary key. New Guid is generated if dev don’t set one.
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        // UTC — good for servers in different time zones.
    }
}