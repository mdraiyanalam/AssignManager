using AssignmentManager.Controllers;
using AssignmentManager.Validators;

namespace AssignmentManager.Tests.NUnit.UnitTests.Validators;

public sealed class CreateUserDtoValidatorTests
{
    private readonly CreateUserDtoValidator _validator = new();

    [Test]
    public void Validate_WithValidUserAndNullPhone_IsValid()
    {
        var dto = new CreateUserDto
        {
            Email = "teacher@example.com",
            Password = "secure-password",
            FullName = "Taylor Teacher",
            RoleName = "Teacher",
            Phone = null
        };

        var result = _validator.Validate(dto);

        Assert.That(result.IsValid, Is.True, string.Join("; ", result.Errors.Select(error => error.ErrorMessage)));
    }

    [Test]
    public void Validate_WithEmptyEmail_ReturnsRequiredMessage()
    {
        var result = _validator.Validate(ValidUser(email: string.Empty));

        AssertInvalidProperty(result, nameof(CreateUserDto.Email), "NotEmptyValidator");
    }

    [Test]
    public void Validate_WithMalformedEmail_ReturnsEmailAddressError()
    {
        var result = _validator.Validate(ValidUser(email: "invalid-email"));

        AssertInvalidProperty(result, nameof(CreateUserDto.Email), "EmailValidator");
    }

    [Test]
    public void Validate_WithEmptyPassword_ReturnsRequiredError()
    {
        var result = _validator.Validate(ValidUser(password: string.Empty));

        AssertInvalidProperty(result, nameof(CreateUserDto.Password), "NotEmptyValidator");
    }

    [Test]
    public void Validate_WithShortPassword_ReturnsMinimumLengthError()
    {
        var result = _validator.Validate(ValidUser(password: "12345"));

        AssertInvalidProperty(result, nameof(CreateUserDto.Password), "MinimumLengthValidator");
    }

    [Test]
    public void Validate_WithEmptyName_ReturnsRequiredError()
    {
        var result = _validator.Validate(ValidUser(fullName: string.Empty));

        AssertInvalidProperty(result, nameof(CreateUserDto.FullName), "NotEmptyValidator");
    }

    [Test]
    public void Validate_WithNameLongerThan100Characters_ReturnsMaximumLengthError()
    {
        var result = _validator.Validate(ValidUser(fullName: new string('a', 101)));

        AssertInvalidProperty(result, nameof(CreateUserDto.FullName), "MaximumLengthValidator");
    }

    [Test]
    public void Validate_WithEmptyRole_ReturnsRequiredError()
    {
        var result = _validator.Validate(ValidUser(roleName: string.Empty));

        AssertInvalidProperty(result, nameof(CreateUserDto.RoleName), "NotEmptyValidator");
    }

    [Test]
    public void Validate_WithUnsupportedRole_ReturnsRoleMessage()
    {
        var result = _validator.Validate(ValidUser(roleName: "Observer"));

        Assert.That(result.IsValid, Is.False);
        Assert.That(result.Errors, Has.Some.Matches<FluentValidation.Results.ValidationFailure>(
            error => error.PropertyName == nameof(CreateUserDto.RoleName)
                && error.ErrorMessage == "Role must be Admin, Teacher or Student"));
    }

    [TestCase("Admin")]
    [TestCase("Teacher")]
    [TestCase("Student")]
    public void Validate_WithSupportedRole_IsValid(string role)
    {
        var result = _validator.Validate(ValidUser(roleName: role));

        Assert.That(result.IsValid, Is.True);
    }

    private static CreateUserDto ValidUser(
        string email = "teacher@example.com",
        string password = "secure-password",
        string fullName = "Taylor Teacher",
        string roleName = "Teacher")
    {
        return new CreateUserDto
        {
            Email = email,
            Password = password,
            FullName = fullName,
            RoleName = roleName
        };
    }

    private static void AssertInvalidProperty(
        FluentValidation.Results.ValidationResult result,
        string propertyName,
        string errorCode)
    {
        Assert.That(result.IsValid, Is.False);
        Assert.That(result.Errors, Has.Some.Matches<FluentValidation.Results.ValidationFailure>(
            error => error.PropertyName == propertyName && error.ErrorCode == errorCode));
    }
}
