using AssignmentManager.Controllers;
using AssignmentManager.Validators;

namespace AssignmentManager.Tests.NUnit.UnitTests.Validators;

public sealed class LoginDtoValidatorTests
{
    private readonly LoginDtoValidator _validator = new();

    [Test]
    public void Validate_WithValidCredentials_IsValid()
    {
        var result = _validator.Validate(new LoginDto
        {
            Email = "student@example.com",
            Password = "secure-password"
        });

        Assert.That(result.IsValid, Is.True);
    }

    [Test]
    public void Validate_WithEmptyEmail_ReturnsRequiredMessage()
    {
        var result = _validator.Validate(new LoginDto
        {
            Email = string.Empty,
            Password = "secure-password"
        });

        AssertError(result, nameof(LoginDto.Email), "Email is required");
    }

    [Test]
    public void Validate_WithMalformedEmail_ReturnsFormatMessage()
    {
        var result = _validator.Validate(new LoginDto
        {
            Email = "not-an-email",
            Password = "secure-password"
        });

        AssertError(result, nameof(LoginDto.Email), "Invalid email format");
    }

    [Test]
    public void Validate_WithEmptyPassword_ReturnsRequiredMessage()
    {
        var result = _validator.Validate(new LoginDto
        {
            Email = "student@example.com",
            Password = string.Empty
        });

        AssertError(result, nameof(LoginDto.Password), "Password is required");
    }

    [Test]
    public void Validate_WithShortPassword_ReturnsMinimumLengthMessage()
    {
        var result = _validator.Validate(new LoginDto
        {
            Email = "student@example.com",
            Password = "short"
        });

        AssertError(result, nameof(LoginDto.Password), "Password must be at least 6 characters");
    }

    private static void AssertError(FluentValidation.Results.ValidationResult result, string property, string message)
    {
        Assert.That(result.IsValid, Is.False);
        Assert.That(result.Errors, Has.Some.Matches<FluentValidation.Results.ValidationFailure>(
            error => error.PropertyName == property && error.ErrorMessage == message));
    }
}
