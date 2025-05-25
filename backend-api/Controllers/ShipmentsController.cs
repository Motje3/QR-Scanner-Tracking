using backend_api.DTOs;
using backend_api.Models;
using backend_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShipmentsController : ControllerBase
    {
        private readonly IShipmentService _service;

        public ShipmentsController(IShipmentService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Shipment>>> GetAll()
        {
            var shipments = await _service.GetAllShipmentsAsync();
            return Ok(shipments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Shipment>> GetById(int id)
        {
            var shipment = await _service.GetShipmentByIdAsync(id);
            if (shipment == null)
            {
                return NotFound();
            }

            return Ok(shipment);
        }

        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<ActionResult<Shipment>> UpdateStatus(int id, StatusUpdateDto dto)
        {
            // get the username from the JWT / cookie
            var username = User.Identity?.Name ?? "unknown";

            var updated = await _service.UpdateStatusAsync(id, dto.Status, username);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpGet("me/today")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Shipment>>> GetMyShipmentsForToday()
        {
            var username = User.Identity!.Name!;
            var today = DateTime.UtcNow;
            var list = await _service.GetShipmentsForUserAsync(username, today);
            return Ok(list);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Shipment>>> GetMine()
        {
            var username = User.Identity!.Name!;
            var list = await _service.GetShipmentsForUserAsync(username);
            return Ok(list);
        }

        [HttpPost]
        public async Task<ActionResult<Shipment>> CreateShipment([FromBody] CreateShipmentDto shipmentDto)
        {

            try
            {
                var createdShipment = await _service.CreateShipmentAsync(shipmentDto);


                return CreatedAtAction(nameof(GetById), new { id = createdShipment.Id }, createdShipment);
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new ProblemDetails { Title = "Invalid input for shipment creation.", Detail = ex.Message });
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"Error creating shipment: {ex.ToString()}");
                return StatusCode(500, new ProblemDetails { Title = "An unexpected error occurred while creating the shipment." });
            }
        }
    }
}
