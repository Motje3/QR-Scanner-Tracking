using BackendAPI.Controllers;
using BackendAPI.DTOs;
using BackendAPI.Models;
using BackendAPI.Services;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;
using Microsoft.AspNetCore.TestHost;

namespace BackendAPI.IntegrationTests
{
    public class ShipmentsControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly Mock<IShipmentService> _mockService;

        public ShipmentsControllerTests(WebApplicationFactory<Program> factory)
        {
            _mockService = new Mock<IShipmentService>();

            var customizedFactory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Vervang IShipmentService door mock
                    services.AddScoped(sp => _mockService.Object);
                });
            });

            _client = customizedFactory.CreateClient();
        }

        [Fact]
        public async Task GetAll_ReturnsOkWithShipments()
        {
            var shipments = new List<Shipment>
            {
                new Shipment { Id = 1, Status = "Pending" },
                new Shipment { Id = 2, Status = "Delivered" }
            };
            _mockService.Setup(s => s.GetAllShipmentsAsync()).ReturnsAsync(shipments);

            var response = await _client.GetAsync("/api/Shipments");
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<List<Shipment>>();
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task GetById_ReturnsShipment_WhenFound()
        {
            var shipment = new Shipment { Id = 1, Status = "Pending" };
            _mockService.Setup(s => s.GetShipmentByIdAsync(1)).ReturnsAsync(shipment);

            var response = await _client.GetAsync("/api/Shipments/1");
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<Shipment>();
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("Pending", result.Status);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenMissing()
        {
            _mockService.Setup(s => s.GetShipmentByIdAsync(99)).ReturnsAsync((Shipment?)null);

            var response = await _client.GetAsync("/api/Shipments/99");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task UpdateStatus_ReturnsOkWithUpdatedShipment_WhenSuccessful()
        {
            var dto = new StatusUpdateDto { Status = "Delivered" };
            var updatedShipment = new Shipment
            {
                Id = 1,
                Status = "Delivered",
                LastUpdatedBy = "testuser",
                LastUpdatedAt = DateTime.UtcNow
            };

            _mockService.Setup(s => s.UpdateStatusAsync(1, dto.Status, "testuser"))
                        .ReturnsAsync(updatedShipment);

            // Simuleer gebruiker via JWT-claims
            var client = GetAuthenticatedClient("testuser");

            var response = await client.PutAsJsonAsync("/api/Shipments/1/status", dto);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<Shipment>();
            Assert.NotNull(result);
            Assert.Equal("Delivered", result.Status);
            Assert.Equal("testuser", result.LastUpdatedBy);
        }

        [Fact]
        public async Task UpdateStatus_ReturnsNotFound_WhenShipmentDoesNotExist()
        {
            var dto = new StatusUpdateDto { Status = "Delivered" };
            _mockService.Setup(s => s.UpdateStatusAsync(99, dto.Status, It.IsAny<string>())).ReturnsAsync((Shipment?)null);

            var client = GetAuthenticatedClient("anyuser");

            var response = await client.PutAsJsonAsync("/api/Shipments/99/status", dto);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetMyShipmentsForToday_ReturnsShipments()
        {
            var shipments = new List<Shipment>
            {
                new Shipment { Id = 1, AssignedTo = "user1", ExpectedDelivery = DateTime.UtcNow.ToString("yyyy-MM-dd") }
            };

            _mockService.Setup(s => s.GetShipmentsForUserAsync("user1", It.IsAny<DateTime>()))
                        .ReturnsAsync(shipments);

            var client = GetAuthenticatedClient("user1");

            var response = await client.GetAsync("/api/Shipments/me/today");
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<List<Shipment>>();
            Assert.NotNull(result);
            Assert.Single(result);
        }

        [Fact]
        public async Task GetMine_ReturnsShipments()
        {
            var shipments = new List<Shipment>
            {
                new Shipment { Id = 2, AssignedTo = "user2" }
            };

            _mockService.Setup(s => s.GetShipmentsForUserAsync("user2"))
                        .ReturnsAsync(shipments);

            var client = GetAuthenticatedClient("user2");

            var response = await client.GetAsync("/api/Shipments/me");
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<List<Shipment>>();
            Assert.NotNull(result);
            Assert.Single(result);
        }
        [Fact]
        public async Task GetAll_ReturnsEmptyList_WhenNoShipments()
        {
            _mockService.Setup(s => s.GetAllShipmentsAsync()).ReturnsAsync(new List<Shipment>());

            var response = await _client.GetAsync("/api/Shipments");
            response.EnsureSuccessStatusCode();

            var shipments = await response.Content.ReadFromJsonAsync<List<Shipment>>();
            Assert.NotNull(shipments);
            Assert.Empty(shipments);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        public async Task GetById_ReturnsBadRequest_ForInvalidId(int invalidId)
        {
            var response = await _client.GetAsync($"/api/Shipments/{invalidId}");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task UpdateStatus_ReturnsUnauthorized_WhenNotAuthenticated()
        {
            var dto = new StatusUpdateDto { Status = "Delivered" };

            var response = await _client.PutAsJsonAsync("/api/Shipments/1/status", dto);

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task GetMine_ReturnsOnlyUserShipments()
        {
            var shipments = new List<Shipment>
            {
                new Shipment { Id = 10, AssignedTo = "user1" },
                new Shipment { Id = 11, AssignedTo = "user1" }
            };

            _mockService.Setup(s => s.GetShipmentsForUserAsync("user1"))
                .ReturnsAsync(shipments);

            var client = GetAuthenticatedClient("user1");

            var response = await client.GetAsync("/api/Shipments/me");
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<List<Shipment>>();
            Assert.All(result, s => Assert.Equal("user1", s.AssignedTo));
        }

        [Fact]
        public async Task UpdateStatus_ReturnsServerError_OnException()
        {
            var dto = new StatusUpdateDto { Status = "Delivered" };

            _mockService.Setup(s => s.UpdateStatusAsync(1, dto.Status, It.IsAny<string>()))
                .ThrowsAsync(new Exception("Boom"));

            var client = GetAuthenticatedClient("user");

            var response = await client.PutAsJsonAsync("/api/Shipments/1/status", dto);

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        [Fact]
        public async Task GetAll_ReturnsServerError_OnServiceException()
        {
            _mockService.Setup(s => s.GetAllShipmentsAsync())
                .ThrowsAsync(new Exception("Service down"));

            var response = await _client.GetAsync("/api/Shipments");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        [Fact]
        public async Task GetById_ReturnsServerError_OnServiceException()
        {
            _mockService.Setup(s => s.GetShipmentByIdAsync(1))
                .ThrowsAsync(new Exception("DB fail"));

            var response = await _client.GetAsync("/api/Shipments/1");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }





        // Helper: Maak een client met een gesimuleerde authenticated user
        private HttpClient GetAuthenticatedClient(string username)
        {
            var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    services.AddScoped(sp => _mockService.Object);
                });
                builder.ConfigureTestServices(services =>
                {
                    services.AddAuthentication("Test")
                        .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, TestAuthHandler>(
                            "Test", options => { });
                });
            });

            var client = factory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Test");

            TestAuthHandler.Username = username;
            return client;
        }
    }

    // Custom authentication handler voor test
    public class TestAuthHandler : Microsoft.AspNetCore.Authentication.AuthenticationHandler<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions>
    {
        public static string Username = "testuser";

        public TestAuthHandler(
            Microsoft.Extensions.Options.IOptionsMonitor<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions> options,
            Microsoft.Extensions.Logging.ILoggerFactory logger,
            System.Text.Encodings.Web.UrlEncoder encoder,
            Microsoft.AspNetCore.Authentication.ISystemClock clock)
            : base(options, logger, encoder, clock)
        { }

        protected override Task<Microsoft.AspNetCore.Authentication.AuthenticateResult> HandleAuthenticateAsync()
        {
            var claims = new[] { new Claim(ClaimTypes.Name, Username) };
            var identity = new ClaimsIdentity(claims, "Test");
            var principal = new ClaimsPrincipal(identity);
            var ticket = new Microsoft.AspNetCore.Authentication.AuthenticationTicket(principal, "Test");

            return Task.FromResult(Microsoft.AspNetCore.Authentication.AuthenticateResult.Success(ticket));
        }
    }

    public class StatusUpdateDto
    {
        public string Status { get; set; } = string.Empty;
    }
}