using BackendAPI.DTOs;
using BackendAPI.Models;

namespace BackendAPI.Services
{
    public interface IProfileService
    {
        Task<Profile?> GetProfileAsync(int id);
        Task<Profile> UpdateProfileAsync(int id, UpdateProfileDto dto);
        Task<bool> ChangePasswordAsync(int id, ChangePasswordDto dto);
        Task<Profile> UpdateSettingsAsync(int id, UpdateSettingsDto dto);
        Task<Profile?> LoginAsync(string username, string password);
        Task<Profile> CreateProfileAsync(RegisterUserDto dto);
        Task<IEnumerable<Profile>> GetAllProfilesAsync();
    }
}
