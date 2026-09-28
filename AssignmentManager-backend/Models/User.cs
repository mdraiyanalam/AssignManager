namespace AssignmentManager.Models
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        // Change it to BCrypt. It's plain and insecured
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; } // null until first login

        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }
}

/*
 What would you improve?:
1) never return PasswordHash from API (use DTO)
2) email confirmed, lockout, check for refresh tokens for secret token needed or not
3) maybe i can add point 2 and add them in readme.md
 */