using backend_api.DTOs;
using backend_api.Services;
using Microsoft.AspNetCore.Mvc;
using backend_api.Models;


namespace backend_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;
        private readonly ITokenService _tokenService;

        public ProfileController(IProfileService profileService, ITokenService tokenService)
        {
            _profileService = profileService;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _profileService.LoginAsync(dto.Username, dto.Password);
            if (user == null)
                return Unauthorized("Gebruiker niet gevonden of wachtwoord onjuist");

            // 🔐 Create JWT with only essential claims
            var token = _tokenService.CreateToken(user);

            // ✅ Return token + user preferences separately
            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Username,
                    user.AccentColor,
                    user.DarkMode,
                    user.NotificationsEnabled
                }
            });
        }

        [HttpPost("create")]
        public async Task<ActionResult<Profile>> CreateUserProfile([FromBody] RegisterUserDto dto)
        {

            try
            {
                var createdProfile = await _profileService.CreateProfileAsync(dto);

                return CreatedAtAction(nameof(GetProfile), new { id = createdProfile.Id }, createdProfile);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }



        [HttpGet("{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            var profile = await _profileService.GetProfileAsync(id);
            if (profile == null)
                return NotFound("Profiel niet gevonden");

            return Ok(profile);
        }

        // New GET endpoint to fetch all profiles (for Admins)
        [HttpGet]
        // [Authorize(Roles = "Admin")] // IMPORTANT: Protect this for Admin use only!
        public async Task<ActionResult<IEnumerable<Profile>>> GetAllProfiles()
        {
            var profiles = await _profileService.GetAllProfilesAsync();
            return Ok(profiles);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileDto dto)
        {
            try
            {
                var updated = await _profileService.UpdateProfileAsync(id, dto);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id}/change-password")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordDto dto)
        {
            try
            {
                var success = await _profileService.ChangePasswordAsync(id, dto);
                if (!success)
                    return BadRequest("Oud wachtwoord is onjuist");

                return Ok(new { message = "Wachtwoord succesvol gewijzigd" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("{id}/settings")]
        public async Task<IActionResult> UpdateSettings(int id, [FromBody] UpdateSettingsDto dto)
        {
            try
            {
                var updated = await _profileService.UpdateSettingsAsync(id, dto);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
