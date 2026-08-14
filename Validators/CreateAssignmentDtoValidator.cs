using FluentValidation;
using AssignmentManager.Controllers;

namespace AssignmentManager.Validators
{
    public class CreateAssignmentDtoValidator : AbstractValidator<CreateAssignmentDto>
    {
        public CreateAssignmentDtoValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
            RuleFor(x => x.MaxMarks).GreaterThan(0);
            RuleFor(x => x.Deadline).GreaterThan(DateTime.UtcNow).WithMessage("Deadline must be in the future");
            RuleFor(x => x.ClassId).NotEmpty();
            RuleFor(x => x.SubjectId).NotEmpty();
        }
    }
}