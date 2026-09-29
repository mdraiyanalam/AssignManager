using System.Globalization;
using FluentValidation;
using NUnit.Framework;

namespace AssignmentManager.Tests.NUnit;

[SetUpFixture]
public sealed class GlobalSetup
{
    [OneTimeSetUp]
    public void ConfigureValidationMessages()
    {
        ValidatorOptions.Global.LanguageManager.Culture = CultureInfo.InvariantCulture;
    }
}
