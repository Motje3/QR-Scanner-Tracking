using backend_api.Models;
using backend_api.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Xunit;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;

namespace backend_api.Tests.TestService
{
    public class TokenServiceTests
    {
        private const string ValidKey = "ThisIsAValidKeyWithEnoughLength123!";
        private const string Issuer = "test_issuer";
        private const string Audience = "test_audience";

        private Profile TestUser => new Profile
        {
            Id = 42,
            Username = "unittest",
            FullName = "Unit Test"
        };

        private TokenService CreateService(Dictionary<string, string>? overrides = null)
        {
            var configMock = new Mock<IConfiguration>();
            configMock.Setup(c => c["Jwt:Key"]).Returns(overrides?.GetValueOrDefault("Jwt:Key") ?? ValidKey);
            configMock.Setup(c => c["Jwt:Issuer"]).Returns(overrides?.GetValueOrDefault("Jwt:Issuer") ?? Issuer);
            configMock.Setup(c => c["Jwt:Audience"]).Returns(overrides?.GetValueOrDefault("Jwt:Audience") ?? Audience);

            return new TokenService(configMock.Object);
        }

        [Fact]
        public void Constructor_Throws_WhenConfigIsNull()
        {
            Assert.Throws<ArgumentNullException>(() => new TokenService(null!));
        }

        [Fact]
        public void CreateToken_ValidProfile_ReturnsToken()
        {
            var service = CreateService();
            var token = service.CreateToken(TestUser);
            Assert.False(string.IsNullOrWhiteSpace(token));
        }

        [Fact]
        public void CreateToken_NullProfile_Throws()
        {
            var service = CreateService();
            Assert.Throws<ArgumentNullException>(() => service.CreateToken(null!));
        }

        [Fact]
        public void CreateToken_EmptyUsername_Throws()
        {
            var service = CreateService();
            var user = new Profile { Id = 2, Username = "", FullName = "Empty" };
            Assert.Throws<ArgumentException>(() => service.CreateToken(user));
        }

        [Fact]
        public void CreateToken_WhitespaceUsername_Throws()
        {
            var service = CreateService();
            var user = new Profile { Id = 3, Username = "   ", FullName = "Whitespace" };
            Assert.Throws<ArgumentException>(() => service.CreateToken(user));
        }

        [Fact]
        public void CreateToken_ShortKey_Throws()
        {
            var overrides = new Dictionary<string, string> { { "Jwt:Key", "short" } };
            var service = CreateService(overrides);
            Assert.Throws<ArgumentOutOfRangeException>(() => service.CreateToken(TestUser));
        }

        [Fact]
        public void CreateToken_MissingIssuer_Throws()
        {
            var configMock = new Mock<IConfiguration>();
            configMock.Setup(c => c["Jwt:Key"]).Returns(ValidKey);
            configMock.Setup(c => c["Jwt:Issuer"]).Returns((string?)null); // <-- Hier expliciet null
            configMock.Setup(c => c["Jwt:Audience"]).Returns(Audience);

            var service = new TokenService(configMock.Object);
            Assert.Throws<InvalidOperationException>(() => service.CreateToken(TestUser));
        }

        [Fact]
        public void CreateToken_MissingAudience_Throws()
        {
            var configMock = new Mock<IConfiguration>();
            configMock.Setup(c => c["Jwt:Key"]).Returns(ValidKey);
            configMock.Setup(c => c["Jwt:Issuer"]).Returns(Issuer);
            configMock.Setup(c => c["Jwt:Audience"]).Returns((string?)null); // <-- Hier expliciet null

            var service = new TokenService(configMock.Object);
            Assert.Throws<InvalidOperationException>(() => service.CreateToken(TestUser));
        }


        [Fact]
        public void CreateToken_ReturnsTokenWithCorrectClaims()
        {
            var service = CreateService();
            var token = service.CreateToken(TestUser);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            Assert.Contains(jwt.Claims, c => c.Type == ClaimTypes.Name && c.Value == TestUser.Username);
            Assert.Contains(jwt.Claims, c => c.Type == "userId" && c.Value == TestUser.Id.ToString());
        }

        [Fact]
        public void CreateToken_ExpiresInSevenDays()
        {
            var service = CreateService();
            var token = service.CreateToken(TestUser);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            var expected = DateTime.UtcNow.AddDays(7);
            Assert.InRange((jwt.ValidTo - expected).TotalMinutes, -2, 2);
        }

        [Fact]
        public void CreateToken_UsesHmacSha256Algorithm()
        {
            var service = CreateService();
            var token = service.CreateToken(TestUser);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            Assert.Equal(SecurityAlgorithms.HmacSha256, jwt.Header.Alg);
        }

        [Fact]
        public void CreateToken_ZeroUserId_StillCreatesValidToken()
        {
            var user = new Profile { Id = 0, Username = "zero", FullName = "Zero ID" };
            var service = CreateService();
            var token = service.CreateToken(user);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            Assert.Contains(jwt.Claims, c => c.Type == "userId" && c.Value == "0");
        }

        [Fact]
        public void CreateToken_NegativeUserId_StillCreatesValidToken()
        {
            var user = new Profile { Id = -10, Username = "negative", FullName = "Negative ID" };
            var service = CreateService();
            var token = service.CreateToken(user);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            Assert.Contains(jwt.Claims, c => c.Type == "userId" && c.Value == "-10");
        }

        [Fact]
        public void CreateToken_LongUsername_IsHandledCorrectly()
        {
            var longUsername = new string('x', 300);
            var user = new Profile { Id = 99, Username = longUsername, FullName = "Long" };
            var service = CreateService();
            var token = service.CreateToken(user);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            Assert.Contains(jwt.Claims, c => c.Type == ClaimTypes.Name && c.Value == longUsername);
        }

        [Fact]
        public void CreateToken_WithSpecialCharactersInUsername_IsHandledCorrectly()
        {
            var specialUsername = "äöüß@#%$*!";
            var user = new Profile { Id = 50, Username = specialUsername, FullName = "Special Chars" };
            var service = CreateService();
            var token = service.CreateToken(user);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            Assert.Contains(jwt.Claims, c => c.Type == ClaimTypes.Name && c.Value == specialUsername);
        }

        [Fact]
        public void CreateToken_ContainsCorrectIssuerAndAudience()
        {
            var service = CreateService();
            var token = service.CreateToken(TestUser);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            Assert.Equal(Issuer, jwt.Issuer);
            Assert.Equal(Audience, jwt.Audiences.FirstOrDefault());
        }

        [Fact]
        public void CreateToken_VeryLargeUsername_DoesNotThrow()
        {
            var longUsername = new string('x', 5000); // enorme payload
            var user = new Profile { Id = 100, Username = longUsername, FullName = "Large" };
            var service = CreateService();

            var token = service.CreateToken(user);
            Assert.False(string.IsNullOrEmpty(token));
        }

        [Fact]
        public void CreateToken_CanBeValidatedWithSameKey()
        {
            var service = CreateService();
            var token = service.CreateToken(TestUser);

            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParams = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = Issuer,
                ValidAudience = Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(ValidKey)),
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(5)
            };

            tokenHandler.ValidateToken(token, validationParams, out SecurityToken validatedToken);
            Assert.NotNull(validatedToken);
        }

        [Fact]
        public void CreateToken_KeyWith15Bytes_Throws()
        {
            var overrides = new Dictionary<string, string> { { "Jwt:Key", "1234567890abcde" } }; // 15 tekens
            var service = CreateService(overrides);

            Assert.Throws<ArgumentOutOfRangeException>(() => service.CreateToken(TestUser));
        }



        [Fact]
        public void CreateToken_KeyWithUnicodeCharacters_Works()
        {
            var unicodeKey = "🔐SecureKeyWithEmoji🔒1234567890!";
            var overrides = new Dictionary<string, string> { { "Jwt:Key", unicodeKey } };
            var service = CreateService(overrides);

            var token = service.CreateToken(TestUser);
            Assert.False(string.IsNullOrEmpty(token));
        }
       

        [Fact]
        public void CreateToken_HasValidFutureExpiryDate()
        {
            var service = CreateService();
            var token = service.CreateToken(TestUser);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            Assert.True(jwt.ValidTo > DateTime.UtcNow);
        }
        [Fact]
        public void CreateToken_DoesNotContainFullNameClaim()
        {
            var service = CreateService();
            var token = service.CreateToken(TestUser);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            Assert.DoesNotContain(jwt.Claims, c => c.Type == "FullName" || c.Value == TestUser.FullName);
        }

        [Fact]
        public void CreateToken_NullUsername_Throws()
        {
            var user = new Profile { Id = 7, Username = null!, FullName = "Null Username" };
            var service = CreateService();

            Assert.Throws<ArgumentException>(() => service.CreateToken(user));
        }

        [Fact]
        public void CreateToken_DoesNotContainKidHeader()
        {
            var service = CreateService();
            var token = service.CreateToken(TestUser);
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

            Assert.False(jwt.Header.ContainsKey("kid"));
        }
        
    }    
}