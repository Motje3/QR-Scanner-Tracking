// Controllers/UserSettingsController.cs
using BackendAPI.Data;
using BackendAPI.Models;
using BackendAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendAPI.Services;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserSettingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IProfileService _profileService;

        public UserSettingsController(AppDbContext context, IProfileService profileService)
        {
            _context = context;
            _profileService = profileService;
        }

        [HttpGet]
        public async Task<ActionResult<UserSettings>> GetUserSettings()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized();

            var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.Username == username);
            if (profile == null)
                return NotFound("Profile not found");

            var settings = await _context.UserSettings
                .FirstOrDefaultAsync(us => us.ProfileId == profile.Id);

            if (settings == null)
            {
                // Create default settings if none exist
                settings = new UserSettings
                {
                    ProfileId = profile.Id,
                    FullName = profile.FullName,
                    Email = profile.Email,
                    EmailNotifications = true,
                    PushNotifications = true,
                    MonthlyReport = true,
                };

                _context.UserSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return Ok(settings);
        }

        [HttpPut]
        public async Task<ActionResult<UserSettings>> UpdateUserSettings([FromBody] UserSettings updatedSettings)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized();

            var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.Username == username);
            if (profile == null)
                return NotFound("Profile not found");

            var existingSettings = await _context.UserSettings
                .FirstOrDefaultAsync(us => us.ProfileId == profile.Id);

            if (existingSettings == null)
                return NotFound("Settings not found");

            // Update fields
            existingSettings.FullName = updatedSettings.FullName;
            existingSettings.Email = updatedSettings.Email;
            existingSettings.EmailNotifications = updatedSettings.EmailNotifications;
            existingSettings.PushNotifications = updatedSettings.PushNotifications;
            existingSettings.MonthlyReport = updatedSettings.MonthlyReport;
            existingSettings.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(existingSettings);
        }

        [HttpPost("change-password")]
        public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try
            {
                var username = User.Identity?.Name;
                if (string.IsNullOrEmpty(username))
                    return Unauthorized();

                var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.Username == username);
                if (profile == null)
                    return NotFound("Profile not found");

                // Now we can use _profileService directly
                var success = await _profileService.ChangePasswordAsync(profile.Id, dto);
                if (!success)
                    return BadRequest("Oud wachtwoord is onjuist");

                return Ok(new { message = "Wachtwoord succesvol gewijzigd" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}