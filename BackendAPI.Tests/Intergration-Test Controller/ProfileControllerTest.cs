using BackendAPI.Controllers;
using BackendAPI.DTOs;
using BackendAPI.Models;
using BackendAPI.Services;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace BackendAPI.IntegrationTests
{
    public class ProfileControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly Mock<IProfileService> _mockService;
        private readonly WebApplicationFactory<Program> _factory;

        public ProfileControllerTests(WebApplicationFactory<Program> factory)
        {
            _mockService = new Mock<IProfileService>();

            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    services.AddScoped(sp => _mockService.Object);
                });
            });

            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task Login_ReturnsTokenAndUser_WhenValidCredentials()
        {
            var testUser = new Profile
            {
                Id = 1,
                Username = "user1",
                Password = "password123",
                FullName = "Test User",
                AccentColor = "blue",
                DarkMode = true,
                NotificationsEnabled = false
            };

            var loginDto = new LoginDto
            {
                Username = "user1",
                Password = "password123"
            };

            _mockService.Setup(x => x.LoginAsync(loginDto.Username, loginDto.Password))
                        .ReturnsAsync(testUser);

            var response = await _client.PostAsJsonAsync("/api/Profile/login", loginDto);
            var content = await response.Content.ReadFromJsonAsync<LoginResponse>();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.NotNull(content?.Token);
            Assert.Equal("user1", content?.User.Username);
        }
        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenUserNotFound()
        {
            var loginDto = new LoginDto
            {
                Username = "wrong",
                Password = "wrong"
            };

            _mockService.Setup(x => x.LoginAsync(loginDto.Username, loginDto.Password)).ReturnsAsync((Profile?)null);

            var response = await _client.PostAsJsonAsync("/api/Profile/login", loginDto);
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetProfile_ReturnsProfile_WhenExists()
        {
            var profile = new Profile
            {
                Id = 2,
                Username = "john",
                Password = "pass",
                FullName = "John Doe",
                AccentColor = "red",
                DarkMode = false,
                NotificationsEnabled = true
            };

            _mockService.Setup(s => s.GetProfileAsync(2)).ReturnsAsync(profile);

            var response = await _client.GetAsync("/api/Profile/2");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetProfile_ReturnsNotFound_WhenMissing()
        {
            _mockService.Setup(s => s.GetProfileAsync(99)).ReturnsAsync((Profile?)null);

            var response = await _client.GetAsync("/api/Profile/99");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task UpdateProfile_ReturnsUpdatedProfile()
        {
            var dto = new UpdateProfileDto
            {
                FullName = "Jane Doe",
                Email = "jane@example.com",
                ImageUrl = "http://example.com/image.jpg"
            };

            var updatedProfile = new Profile
            {
                Id = 3,
                Username = "jane",
                Password = "pass",
                FullName = dto.FullName,
                Email = dto.Email,
                ImageUrl = dto.ImageUrl,
                AccentColor = "green",
                DarkMode = false,
                NotificationsEnabled = true
            };

            _mockService.Setup(s => s.UpdateProfileAsync(3, dto)).ReturnsAsync(updatedProfile);

            var response = await _client.PutAsJsonAsync("/api/Profile/3", dto);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }


        [Fact]
        public async Task ChangePassword_ReturnsBadRequest_WhenOldPasswordIncorrect()
        {
            var dto = new ChangePasswordDto
            {
                OldPassword = "wrong",
                NewPassword = "new"
            };

            _mockService.Setup(s => s.ChangePasswordAsync(1, dto)).ReturnsAsync(false);

            var response = await _client.PostAsJsonAsync("/api/Profile/1/change-password", dto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }


        [Fact]
        public async Task UpdateSettings_ReturnsUpdated_WhenSuccessful()
        {
            var dto = new UpdateSettingsDto
            {
                AccentColor = "purple",
                DarkMode = true,
                NotificationsEnabled = false
            };

            var updated = new Profile
            {
                Id = 1,
                Username = "test",
                Password = "pw",
                FullName = "User",
                AccentColor = "purple",
                DarkMode = true,
                NotificationsEnabled = false
            };

            _mockService.Setup(s => s.UpdateSettingsAsync(1, dto)).ReturnsAsync(updated);

            var response = await _client.PutAsJsonAsync("/api/Profile/1/settings", dto);

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        }

        [Fact]
        public async Task UpdateSettings_ReturnsBadRequest_OnException()
        {
            var dto = new UpdateSettingsDto
            {
                AccentColor = "red",
                DarkMode = false,
                NotificationsEnabled = true
            };

            _mockService
                .Setup(s => s.UpdateSettingsAsync(2, It.IsAny<UpdateSettingsDto>()))
                .ThrowsAsync(new Exception("Fail"));

            var response = await _client.PutAsJsonAsync("/api/Profile/2/settings", dto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
        [Fact]
        public async Task Login_ReturnsBadRequest_WhenDtoIsInvalid()
        {
            var loginDto = new UserDto(); // Leeg

            var response = await _client.PostAsJsonAsync("/api/Profile/login", loginDto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task GetProfile_ReturnsNotFound_ForNegativeId()
        {
            _mockService.Setup(s => s.GetProfileAsync(-1)).ReturnsAsync((Profile?)null);

            var response = await _client.GetAsync("/api/Profile/-1");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task UpdateProfile_ReturnsBadRequest_OnException()
        {
            var dto = new UpdateProfileDto
            {
                FullName = "Crash",
                Email = "test@fail.com",
                ImageUrl = "x"
            };

            _mockService.Setup(s => s.UpdateProfileAsync(3, It.IsAny<UpdateProfileDto>()))
                        .ThrowsAsync(new Exception("boom"));

            var response = await _client.PutAsJsonAsync("/api/Profile/3", dto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenPasswordIsWrong()
        {
            var dto = new LoginDto
            {
                Username = "test",
                Password = "wrongpass"
            };

            _mockService.Setup(x => x.LoginAsync(dto.Username, dto.Password))
                        .ReturnsAsync((Profile?)null);

            var response = await _client.PostAsJsonAsync("/api/Profile/login", dto);

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task Login_ReturnsBadRequest_WhenBodyIsNull()
        {
            var response = await _client.PostAsync("/api/Profile/login", null);

            Assert.Equal(HttpStatusCode.UnsupportedMediaType, response.StatusCode);
        }

        [Fact]
        public async Task UpdateSettings_ReturnsExpectedAccentColor()
        {
            var dto = new UpdateSettingsDto
            {
                AccentColor = "lime",
                DarkMode = true,
                NotificationsEnabled = false
            };

            var updated = new Profile
            {
                Id = 99,
                Username = "limeuser",
                Password = "xxx",
                FullName = "Lime Guy",
                AccentColor = "lime",
                DarkMode = true,
                NotificationsEnabled = false
            };

            _mockService.Setup(s => s.UpdateSettingsAsync(99, It.IsAny<UpdateSettingsDto>()))
                        .ReturnsAsync(updated);

            var response = await _client.PutAsJsonAsync("/api/Profile/99/settings", dto);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        
        private class LoginResponse
        {
            public string Token { get; set; } = string.Empty;
            public UserDto User { get; set; } = new();
        }

        private class UserDto
        {
            public int Id { get; set; }
            public string Username { get; set; } = string.Empty;
            public string AccentColor { get; set; } = string.Empty;
            public bool DarkMode { get; set; }
            public bool NotificationsEnabled { get; set; }
        }
                
    }
}