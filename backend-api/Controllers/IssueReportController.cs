// In backend_api/Controllers/IssueReportController.cs

using backend_api.Models;
using backend_api.Services;
using backend_api.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace backend_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IssueReportController : ControllerBase
    {
        private readonly IIssueReportService _service;

        public IssueReportController(IIssueReportService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<IssueReport>>> GetAll()
        {
            var reports = await _service.GetAllAsync();
            return Ok(reports ?? new List<IssueReport>());
        }

        // NEW ENDPOINT: Get Issues by ShipmentId
        [HttpGet("shipment/{shipmentId}")]
        public async Task<ActionResult<IEnumerable<IssueReport>>> GetByShipmentId(int shipmentId)
        {
            var reports = await _service.GetByShipmentIdAsync(shipmentId);
            return Ok(reports ?? new List<IssueReport>());
        }

        [HttpPost]
        public async Task<ActionResult<IssueReport>> Create([FromBody] CreateIssueReportDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                var error = new ValidationProblemDetails(new Dictionary<string, string[]>
                {
                    { "Title", new[] { "The Title field is required." } }
                });
                return BadRequest(error);
            }

            if (dto.Title.Length > 255)
            {
                var error = new ValidationProblemDetails(new Dictionary<string, string[]>
                {
                    { "Title", new[] { "The Title must be 255 characters or fewer." } }
                });
                return BadRequest(error);
            }

            if (dto.ShipmentId.HasValue && dto.ShipmentId < 0)
            {
                var error = new ValidationProblemDetails(new Dictionary<string, string[]>
                {
                    { "ShipmentId", new[] { "ShipmentId must be a positive number." } }
                });
                return BadRequest(error);
            }

            var report = new IssueReport
            {
                Title = dto.Title.Trim(),
                Description = dto.Description?.Trim(),
                ImageUrl = dto.ImageUrl?.Trim(),
                ShipmentId = dto.ShipmentId
            };

            try
            {
                var created = await _service.CreateAsync(report);
                return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Unexpected error: {ex.Message}");
            }
        }
    }
}