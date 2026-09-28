using AssignmentManager.Models;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManager.Data
{
    public static class Seeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            // 1. Seed Roles
            if (!await context.Roles.AnyAsync())
            {
                var roles = new List<Role>
                {
                    new Role { Name = "Admin",   Description = "Full system access" },
                    new Role { Name = "Teacher", Description = "Create and grade assignments" },
                    new Role { Name = "Student", Description = "View and submit assignments" }
                };

                await context.Roles.AddRangeAsync(roles);
                await context.SaveChangesAsync();
            }

            // 2. Seed Admin
            if (!await context.Users.AnyAsync(u => u.Email == "admin@assignmanager.com"))
            {
                var adminRole = await context.Roles.FirstAsync(r => r.Name == "Admin");

                var admin = new User
                {
                    Email = "admin@assignmanager.com",
                    FullName = "System Administrator",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    IsActive = true
                };

                context.Users.Add(admin);
                await context.SaveChangesAsync();

                context.UserRoles.Add(new UserRole { UserId = admin.Id, RoleId = adminRole.Id });
                await context.SaveChangesAsync();
            }

            // 3. Seed Teacher
            if (!await context.Users.AnyAsync(u => u.Email == "teacher@assignmanager.com"))
            {
                var teacherRole = await context.Roles.FirstAsync(r => r.Name == "Teacher");

                var teacher = new User
                {
                    Email = "teacher@assignmanager.com",
                    FullName = "Masud Sir",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher@123"),
                    IsActive = true
                };

                context.Users.Add(teacher);
                await context.SaveChangesAsync();

                context.UserRoles.Add(new UserRole { UserId = teacher.Id, RoleId = teacherRole.Id });
                await context.SaveChangesAsync();
            }

            // 4. Seed Student
            if (!await context.Users.AnyAsync(u => u.Email == "student@assignmanager.com"))
            {
                var studentRole = await context.Roles.FirstAsync(r => r.Name == "Student");

                var student = new User
                {
                    Email = "student@assignmanager.com",
                    FullName = "Raiyan Student",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student@123"),
                    IsActive = true
                };

                context.Users.Add(student);
                await context.SaveChangesAsync();

                context.UserRoles.Add(new UserRole { UserId = student.Id, RoleId = studentRole.Id });
                await context.SaveChangesAsync();
            }
        }
    }
}