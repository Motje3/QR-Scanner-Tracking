using backend_api.Data;
using backend_api.DTOs;
using backend_api.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_api.Services
{
    public class ProfileService : IProfileService
    {
        private readonly AppDbContext _context;

        public ProfileService(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Profile?> LoginAsync(string username, string password)
        {
            return await _context.Profiles
                .FirstOrDefaultAsync(u => u.Username == username && u.Password == password);
        }

        public async Task<Profile?> GetProfileAsync(int id)
        {
            return await _context.Profiles.FindAsync(id);
        }

        public async Task<Profile> UpdateProfileAsync(int id, UpdateProfileDto dto)
        {
            var profile = await _context.Profiles.FindAsync(id);
            if (profile == null)
                throw new Exception("Profiel niet gevonden");

            profile.FullName = dto.FullName;
            profile.Email = dto.Email;
            profile.ImageUrl = dto.ImageUrl;

            await _context.SaveChangesAsync();
            return profile;
        }

        public async Task<bool> ChangePasswordAsync(int id, ChangePasswordDto dto)
        {
            var profile = await _context.Profiles.FindAsync(id);
            if (profile == null)
                throw new Exception("Profiel niet gevonden");

            if (profile.Password != dto.OldPassword)
                return false; // Wachtwoord komt niet overeen

            profile.Password = dto.NewPassword;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Profile> UpdateSettingsAsync(int id, UpdateSettingsDto dto)
        {
            var profile = await _context.Profiles.FindAsync(id);
            if (profile == null)
                throw new Exception("Profiel niet gevonden");

            profile.AccentColor = dto.AccentColor;
            profile.DarkMode = dto.DarkMode;
            profile.NotificationsEnabled = dto.NotificationsEnabled;

            await _context.SaveChangesAsync();
            return profile;
        }
    }
}
