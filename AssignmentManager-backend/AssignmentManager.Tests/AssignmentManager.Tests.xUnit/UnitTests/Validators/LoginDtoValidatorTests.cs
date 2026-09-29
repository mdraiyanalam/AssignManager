namespace AssignmentManager.Tests.xUnit.UnitTests.Validators;

public sealed class LoginDtoValidatorTests
{
    [Fact]
    public void Validate_WithValidCredentials_IsValid()
    {
        var validator = new LoginDtoValidator();
        var dto = new LoginDto
        {
            Email = "student@example.com",
            Password = "secure-password"
        };

        var result = validator.Validate(dto);

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_WithInvalidEmailAndShortPassword_IsInvalid()
    {
        var validator = new LoginDtoValidator();
        var dto = new LoginDto
        {
            Email = "not-an-email",
            Password = "short"
        };

        var result = validator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(LoginDto.Email));
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(LoginDto.Password));
    }
}
