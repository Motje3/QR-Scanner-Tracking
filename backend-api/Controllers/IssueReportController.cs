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

            // ✅ Altijd een lege lijst teruggeven in plaats van NoContent()
            return Ok(reports ?? new List<IssueReport>());
        }

        [HttpPost]
        public async Task<ActionResult<IssueReport>> Create([FromBody] CreateIssueReportDto dto)
        {
            // ✅ Validatie op lege string
            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                var error = new ValidationProblemDetails(new Dictionary<string, string[]>
                {
                    { "Title", new[] { "The Title field is required." } }
                });
                return BadRequest(error);
            }

            // ✅ Validatie op maximale lengte
            if (dto.Title.Length > 255)
            {
                var error = new ValidationProblemDetails(new Dictionary<string, string[]>
                {
                    { "Title", new[] { "The Title must be 255 characters or fewer." } }
                });
                return BadRequest(error);
            }

            // ✅ Validatie op negatieve ShipmentId
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
