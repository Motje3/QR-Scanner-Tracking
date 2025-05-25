using backend_api.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using backend_api.DTOs;
using backend_api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;

namespace backend_api.IntegrationTests
{
    public class IssueReportControllerMoreIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly Mock<IIssueReportService> _mockService;
        private readonly WebApplicationFactory<Program> _factory;

        public IssueReportControllerMoreIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _mockService = new Mock<IIssueReportService>();
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    services.AddScoped(sp => _mockService.Object);
                });
            });
            _client = _factory.CreateClient();
        }

        #region GetAll Tests

        [Fact]
        public async Task GetAll_ReturnsOk_EvenWhenServiceReturnsNull()
        {
            _mockService.Setup(service => service.GetAllAsync()).ReturnsAsync((IEnumerable<IssueReport>)null);

            var response = await _client.GetAsync("/api/IssueReport");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var actualReports = await response.Content.ReadFromJsonAsync<List<IssueReport>>();
            Assert.NotNull(actualReports);
            Assert.Empty(actualReports);
        }

        [Fact]
        public async Task GetAll_HandlesServiceExceptionsGracefully()
        {
            _mockService.Setup(service => service.GetAllAsync()).ThrowsAsync(new Exception("Service unavailable"));

            var response = await _client.GetAsync("/api/IssueReport");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        #endregion

        #region Create Tests

        [Fact]
        public async Task Create_ReturnsBadRequest_WhenDtoIsCompletelyEmpty()
        {
            var emptyDto = new CreateIssueReportDto
            {
                Title = "",
                Description = ""
            };

            var response = await _client.PostAsJsonAsync("/api/IssueReport", emptyDto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Create_ReturnsBadRequest_WhenTitleIsOnlyWhitespace()
        {
            var invalidDto = new CreateIssueReportDto
            {
                Title = "   ",
                Description = "Valid description"
            };

            var response = await _client.PostAsJsonAsync("/api/IssueReport", invalidDto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Create_ReturnsCreatedAtAction_WithCorrectRouteValues()
        {
            var createDto = new CreateIssueReportDto
            {
                Title = "Test Report",
                Description = "A test issue.",
                ShipmentId = 99
            };

            var expectedReport = new IssueReport
            {
                Id = 5,
                Title = createDto.Title,
                Description = createDto.Description,
                ShipmentId = createDto.ShipmentId
            };

            _mockService.Setup(service => service.CreateAsync(It.IsAny<IssueReport>())).ReturnsAsync(expectedReport);

            var response = await _client.PostAsJsonAsync("/api/IssueReport", createDto);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            Assert.Equal("/api/IssueReport", response.Headers.Location?.AbsolutePath);
        }

        [Fact]
        public async Task Create_PassesCorrectIssueReportObjectToService()
        {
            var createDto = new CreateIssueReportDto
            {
                Title = "Verify Creation",
                Description = "Check if the service receives the correct object.",
                ImageUrl = "test.png",
                ShipmentId = 123
            };

            IssueReport capturedReport = null;

            _mockService.Setup(service => service.CreateAsync(It.IsAny<IssueReport>()))
                .Callback<IssueReport>(report => capturedReport = report)
                .ReturnsAsync((IssueReport r) => new IssueReport
                {
                    Id = 6,
                    Title = r.Title,
                    Description = r.Description,
                    ImageUrl = r.ImageUrl,
                    ShipmentId = r.ShipmentId,
                    CreatedAt = r.CreatedAt
                });

            await _client.PostAsJsonAsync("/api/IssueReport", createDto);

            _mockService.Verify(service => service.CreateAsync(It.IsAny<IssueReport>()), Times.Once);
            Assert.NotNull(capturedReport);
            Assert.Equal(createDto.Title, capturedReport.Title);
            Assert.Equal(createDto.Description, capturedReport.Description);
            Assert.Equal(createDto.ImageUrl, capturedReport.ImageUrl);
            Assert.Equal(createDto.ShipmentId, capturedReport.ShipmentId);
            Assert.True(capturedReport.CreatedAt != default);
        }

        [Fact]
        public async Task Create_HandlesNullDescriptionAndImageUrlGracefully()
        {
            var createDto = new CreateIssueReportDto
            {
                Title = "Nullable Fields",
                Description = null!,
                ImageUrl = null!,
                ShipmentId = 456
            };

            var expectedReport = new IssueReport
            {
                Id = 7,
                Title = createDto.Title,
                Description = null,
                ImageUrl = null,
                ShipmentId = 456
            };

            _mockService.Setup(service => service.CreateAsync(It.IsAny<IssueReport>())).ReturnsAsync(expectedReport);

            var response = await _client.PostAsJsonAsync("/api/IssueReport", createDto);
            var actualReport = await response.Content.ReadFromJsonAsync<IssueReport>();

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            Assert.Equal(expectedReport.Description, actualReport?.Description);
            Assert.Equal(expectedReport.ImageUrl, actualReport?.ImageUrl);
        }

        [Fact]
        public async Task Create_HandlesNullShipmentIdGracefully()
        {
            var createDto = new CreateIssueReportDto
            {
                Title = "Nullable Shipment",
                Description = "Issue without a shipment link.",
                ShipmentId = null
            };

            var expectedReport = new IssueReport
            {
                Id = 8,
                Title = createDto.Title,
                Description = createDto.Description,
                ShipmentId = null
            };

            _mockService.Setup(service => service.CreateAsync(It.IsAny<IssueReport>())).ReturnsAsync(expectedReport);

            var response = await _client.PostAsJsonAsync("/api/IssueReport", createDto);
            var actualReport = await response.Content.ReadFromJsonAsync<IssueReport>();

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            Assert.Null(actualReport?.ShipmentId);
        }

        [Fact]
        public async Task Create_ReturnsProblemDetails_OnModelStateErrors()
        {
            var invalidDto = new CreateIssueReportDto
            {
                Title = "", // ✅ required veld moet gezet zijn
                Description = "No title"
            };

            var response = await _client.PostAsJsonAsync("/api/IssueReport", invalidDto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var problemDetails = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
            Assert.NotNull(problemDetails);
            Assert.Contains("The Title field is required.", problemDetails!.Errors["Title"].First());
        }

        [Fact]
        public async Task Create_ReturnsBadRequest_WhenTitleIsTooLong()
        {
            var longTitle = new string('A', 300); // 300 chars
            var dto = new CreateIssueReportDto
            {
                Title = longTitle,
                Description = "Some description"
            };

            var response = await _client.PostAsJsonAsync("/api/IssueReport", dto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
        
        [Fact]
        public async Task Create_ReturnsBadRequest_ForNegativeShipmentId()
        {
            var dto = new CreateIssueReportDto
            {
                Title = "Negative",
                Description = "Should fail",
                ShipmentId = -1
            };

            var response = await _client.PostAsJsonAsync("/api/IssueReport", dto);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Create_AllowsDuplicateSubmissions()
        {
            var dto = new CreateIssueReportDto
            {
                Title = "Duplicate Title",
                Description = "Same input twice"
            };

            _mockService.Setup(service => service.CreateAsync(It.IsAny<IssueReport>()))
                .ReturnsAsync((IssueReport r) => new IssueReport
                {
                    Id = new Random().Next(100, 999),
                    Title = r.Title,
                    Description = r.Description,
                    CreatedAt = DateTime.UtcNow
                });

            var res1 = await _client.PostAsJsonAsync("/api/IssueReport", dto);
            var res2 = await _client.PostAsJsonAsync("/api/IssueReport", dto);

            Assert.Equal(HttpStatusCode.Created, res1.StatusCode);
            Assert.Equal(HttpStatusCode.Created, res2.StatusCode);
        }

        [Fact]
        public async Task Create_Throws_InternalServerError_IfServiceFails()
        {
            var dto = new CreateIssueReportDto
            {
                Title = "Should crash",
                Description = "Triggered exception"
            };

            _mockService.Setup(service => service.CreateAsync(It.IsAny<IssueReport>()))
                .ThrowsAsync(new Exception("💥"));

            var response = await _client.PostAsJsonAsync("/api/IssueReport", dto);
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        [Fact]
        public async Task Create_TrimsTitle_Correctly()
        {
            var dto = new CreateIssueReportDto
            {
                Title = "   Trim me   ",
                Description = "should be trimmed"
            };

            IssueReport captured = new IssueReport
            {
                Id = 0, // A dummy ID is fine for initialization
                Title = "Initial Title", // A valid title is required for initialization
                CreatedAt = DateTime.UtcNow // Also good practice to initialize
            };

            _mockService.Setup(service => service.CreateAsync(It.IsAny<IssueReport>()))
                .Callback<IssueReport>(r => captured = r)
                .ReturnsAsync((IssueReport r) => new IssueReport {
                    Id = 100,
                    Title = r.Title,
                    CreatedAt = DateTime.UtcNow
                });

            await _client.PostAsJsonAsync("/api/IssueReport", dto);

            Assert.Equal("Trim me", captured.Title);
        }

        #endregion
    }
}
