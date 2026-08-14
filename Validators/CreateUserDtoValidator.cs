using FluentValidation;
using AssignmentManager.Controllers;

namespace AssignmentManager.Validators
{
    public class CreateUserDtoValidator : AbstractValidator<CreateUserDto>
    {
        public CreateUserDtoValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
            RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.RoleName).NotEmpty().Must(r => r == "Admin" || r == "Teacher" || r == "Student")
                .WithMessage("Role must be Admin, Teacher or Student");
        }
    }
}