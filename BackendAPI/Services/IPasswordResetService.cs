using BackendAPI.DTOs;
using BackendAPI.Models;

namespace BackendAPI.Services
{
    public interface IPasswordResetService
    {
        Task<PasswordResetRequest> CreateAsync(PasswordResetRequestDto dto);
        Task<IEnumerable<PasswordResetRequest>> GetAllAsync();
        Task<bool> MarkAsProcessed(int id);
    }
}