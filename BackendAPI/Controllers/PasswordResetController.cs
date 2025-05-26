using BackendAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PasswordResetController : ControllerBase
    {
        private readonly IPasswordResetService _service;

        public PasswordResetController(IPasswordResetService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> RequestReset([FromBody] PasswordResetRequestDto dto)
        {
            try
            {
                await _service.CreateAsync(dto);
                return Ok(new { message = "Resetverzoek ingediend" });
            }
            catch (ArgumentException ex)
            {
                var problem = new ValidationProblemDetails(new Dictionary<string, string[]>
                {
                    { ex.ParamName ?? "Input", new[] { ex.Message } }
                });
                return BadRequest(problem);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Unexpected error: {ex.Message}");
            }
        }
    }
}
