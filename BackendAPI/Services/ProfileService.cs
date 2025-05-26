using BackendAPI.Data;
using BackendAPI.DTOs;
using BackendAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Services
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

        public async Task<Profile> CreateProfileAsync(RegisterUserDto dto)
        {
            if (dto == null)
            {
                throw new ArgumentNullException(nameof(dto));
            }

            // Check if username already exists
            if (await _context.Profiles.AnyAsync(p => p.Username == dto.Username))
            {
                throw new Exception($"Username '{dto.Username}' is already taken.");
            }

            // Check if email already exists (if email is provided and should be unique)
            if (!string.IsNullOrEmpty(dto.Email) && await _context.Profiles.AnyAsync(p => p.Email == dto.Email))
            {
                throw new Exception($"Email '{dto.Email}' is already in use.");
            }

            // IMPORTANT: Password should be hashed here before saving, to be done
            // For now, saving plain text as per existing pattern
            var newProfile = new Profile
            {
                Username = dto.Username,
                Password = dto.Password,
                FullName = dto.FullName,
                Email = dto.Email ?? string.Empty,
                Role = dto.Role,
                CreatedAt = DateTime.UtcNow,
            };

            _context.Profiles.Add(newProfile);
            await _context.SaveChangesAsync();

            return newProfile;
        }

        public async Task<IEnumerable<Profile>> GetAllProfilesAsync()
        {
            // Or use a DTO that omits sensitive information
            return await _context.Profiles
                .Select(p => new Profile
                {
                    Id = p.Id,
                    Username = p.Username,
                    FullName = p.FullName,
                    Email = p.Email,
                    Role = p.Role,
                    ImageUrl = p.ImageUrl,
                    AccentColor = p.AccentColor,
                    DarkMode = p.DarkMode,
                    NotificationsEnabled = p.NotificationsEnabled,
                    CreatedAt = p.CreatedAt
                    // DO NOT INCLUDE p.Password here
                })
                .ToListAsync();
        }
    }
}
