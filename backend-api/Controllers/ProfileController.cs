using backend_api.DTOs;
using backend_api.Services;
using Microsoft.AspNetCore.Mvc;
using backend_api.Models; // Required for Profile model return type


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

        // New POST endpoint for admin to create users
        [HttpPost("create")] // Or just [HttpPost] if you want it at /api/Profile
        // [Authorize(Roles = "Admin")] // IMPORTANT: Protect this endpoint for Admin use only!
        public async Task<ActionResult<Profile>> CreateUserProfile([FromBody] RegisterUserDto dto)
        {
            // ModelState validation is automatically handled by [ApiController]
            // for DTOs with validation attributes like [Required].

            try
            {
                var createdProfile = await _profileService.CreateProfileAsync(dto);
                // Return a 201 Created response with the created profile.
                // The GetProfile action takes an int id.
                return CreatedAtAction(nameof(GetProfile), new { id = createdProfile.Id }, createdProfile);
            }
            catch (Exception ex)
            {
                // If username/email already exists, service throws an Exception.
                // Or handle specific custom exceptions if you define them.
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

        // 👇 Wachtwoord wijzigen
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
