using BackendAPI.DTOs;
using BackendAPI.Models;
using BackendAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace BackendAPI.IntegrationTests
{
    public class PasswordResetControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly Mock<IPasswordResetService> _mockService;

        public PasswordResetControllerIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _mockService = new Mock<IPasswordResetService>();

            var customizedFactory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    services.AddScoped(_ => _mockService.Object);
                });
            });

            _client = customizedFactory.CreateClient();
        }

        [Fact]
        public async Task RequestReset_ReturnsOk_WhenValidInput()
        {
            var dto = new PasswordResetRequestDto
            {
                Email = "user@example.com",
                NewPassword = "SecurePass123!"
            };

            _mockService.Setup(s => s.CreateAsync(It.IsAny<PasswordResetRequestDto>()))
                        .ReturnsAsync(new PasswordResetRequest { Id = 1 });

            var response = await _client.PostAsJsonAsync("/api/PasswordReset", dto);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var message = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
            Assert.Equal("Resetverzoek ingediend", message?["message"]);
        }

        [Theory]
        [InlineData("", "password")]
        [InlineData("email@example.com", "")]
        [InlineData("   ", "   ")]
        [InlineData("not-an-email", "validpass")]
        public async Task RequestReset_ReturnsBadRequest_WhenInvalidInput(string email, string password)
        {
            var dto = new PasswordResetRequestDto { Email = email, NewPassword = password };

            _mockService.Setup(s => s.CreateAsync(It.IsAny<PasswordResetRequestDto>()))
                        .ThrowsAsync(new ArgumentException("invalid", nameof(email)));

            var response = await _client.PostAsJsonAsync("/api/PasswordReset", dto);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task RequestReset_Throws500_OnServiceError()
        {
            var dto = new PasswordResetRequestDto
            {
                Email = "crash@example.com",
                NewPassword = "something"
            };

            _mockService.Setup(s => s.CreateAsync(It.IsAny<PasswordResetRequestDto>()))
                        .ThrowsAsync(new Exception("💥"));

            var response = await _client.PostAsJsonAsync("/api/PasswordReset", dto);
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        [Fact]
        public async Task RequestReset_AllowsDuplicateRequests()
        {
            var dto = new PasswordResetRequestDto
            {
                Email = "duplicate@example.com",
                NewPassword = "samepass"
            };

            _mockService.Setup(s => s.CreateAsync(It.IsAny<PasswordResetRequestDto>()))
                        .ReturnsAsync(new PasswordResetRequest());

            var res1 = await _client.PostAsJsonAsync("/api/PasswordReset", dto);
            var res2 = await _client.PostAsJsonAsync("/api/PasswordReset", dto);

            Assert.Equal(HttpStatusCode.OK, res1.StatusCode);
            Assert.Equal(HttpStatusCode.OK, res2.StatusCode);
        }

        [Fact]
        public async Task RequestReset_SendsExactInput_Unmodified()
        {
            PasswordResetRequestDto captured = null!;

            _mockService.Setup(s => s.CreateAsync(It.IsAny<PasswordResetRequestDto>()))
                .Callback<PasswordResetRequestDto>(r => captured = r)
                .ReturnsAsync(new PasswordResetRequest());

            var dto = new PasswordResetRequestDto
            {
                Email = "   user@domain.com   ",
                NewPassword = "  trimmed123   "
            };

            await _client.PostAsJsonAsync("/api/PasswordReset", dto);

            Assert.Equal("   user@domain.com   ", captured.Email);
            Assert.Equal("  trimmed123   ", captured.NewPassword);
        }

        [Fact]
        public async Task RequestReset_AllowsLargePassword()
        {
            var dto = new PasswordResetRequestDto
            {
                Email = "user@example.com",
                NewPassword = new string('A', 600)
            };

            _mockService.Setup(s => s.CreateAsync(It.IsAny<PasswordResetRequestDto>()))
                        .ReturnsAsync(new PasswordResetRequest());

            var response = await _client.PostAsJsonAsync("/api/PasswordReset", dto);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
        
    }
}