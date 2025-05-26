// In backend_api/Controllers/IssueReportController.cs

using BackendAPI.Models;
using BackendAPI.Services;
using BackendAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using System; // Add for Exception

namespace BackendAPI.Controllers
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

        // NEW ENDPOINT: Update IssueReport
        [HttpPut("{id}")]
        public async Task<ActionResult<IssueReport>> Update(int id, [FromBody] UpdateIssueReportDto dto)
        {
            try
            {
                var updatedReport = await _service.UpdateAsync(id, dto);
                if (updatedReport == null)
                {
                    return NotFound($"Issue report with ID {id} not found.");
                }
                return Ok(updatedReport);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Unexpected error updating issue report: {ex.Message}");
            }
        }
    }
}