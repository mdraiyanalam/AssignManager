using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace AssignmentManager.Helpers
{
    public static class JwtHelper
    {
        public static string GenerateToken(string userId, IConfiguration config)
        {
            if (string.IsNullOrWhiteSpace(config["Jwt:Key"]))
                throw new InvalidOperationException("JWT signing key is not configured (Jwt:Key).");

            var keyString = config["Jwt:Key"]!;
            var issuer = config["Jwt:Issuer"] ?? string.Empty;
            var audience = config["Jwt:Audience"] ?? string.Empty;

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}