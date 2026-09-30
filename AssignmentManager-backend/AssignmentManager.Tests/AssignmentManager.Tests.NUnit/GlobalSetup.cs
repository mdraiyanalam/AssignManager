global using NUnit.Framework;

using System.Globalization;
using FluentValidation;

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
