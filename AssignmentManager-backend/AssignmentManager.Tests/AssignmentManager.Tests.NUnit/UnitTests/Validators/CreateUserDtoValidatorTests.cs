using AssignmentManager.Controllers;
using AssignmentManager.Validators;
using NUnit.Framework;

namespace AssignmentManager.Tests.NUnit.UnitTests.Validators;

public sealed class CreateUserDtoValidatorTests
{
    [Test]
    public void Validate_WithValidUser_IsValid()
    {
        var validator = new CreateUserDtoValidator();
        var dto = new CreateUserDto
        {
            Email = "teacher@example.com",
            Password = "secure-password",
            FullName = "Taylor Teacher",
            RoleName = "Teacher"
        };

        var result = validator.Validate(dto);

        Assert.That(result.IsValid, Is.True);
    }

    [Test]
    public void Validate_WithUnsupportedRole_IsInvalid()
    {
        var validator = new CreateUserDtoValidator();
        var dto = new CreateUserDto
        {
            Email = "teacher@example.com",
            Password = "secure-password",
            FullName = "Taylor Teacher",
            RoleName = "Observer"
        };

        var result = validator.Validate(dto);

        Assert.That(result.IsValid, Is.False);
        Assert.That(
            result.Errors.Exists(error =>
                error.PropertyName == nameof(CreateUserDto.RoleName)
                && error.ErrorMessage == "Role must be Admin, Teacher or Student"),
            Is.True);
    }
}
