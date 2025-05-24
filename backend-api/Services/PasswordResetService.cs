using backend_api.DTOs;
using backend_api.Models;
using backend_api.Data;
using Microsoft.EntityFrameworkCore;

namespace backend_api.Services
{
    public class PasswordResetService : IPasswordResetService
    {
        private readonly AppDbContext _context;

        public PasswordResetService(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<PasswordResetRequest> CreateAsync(PasswordResetRequestDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            dto.Email = dto.Email?.Trim();

            if (string.IsNullOrWhiteSpace(dto.Email))
                throw new ArgumentException("Email is required.", nameof(dto.Email));

            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                throw new ArgumentException("New password is required.", nameof(dto.NewPassword));

            var req = new PasswordResetRequest
            {
                Email = dto.Email,
                RequestedNewPassword = dto.NewPassword,
                RequestedAt = DateTime.UtcNow,
                Processed = false
            };

            _context.PasswordResetRequests.Add(req);
            await _context.SaveChangesAsync();
            return req;
        }

        public async Task<IEnumerable<PasswordResetRequest>> GetAllAsync()
        {
            return await _context.PasswordResetRequests.ToListAsync();
        }

        public async Task<bool> MarkAsProcessed(int id)
        {
            var request = await _context.PasswordResetRequests.FindAsync(id);
            if (request == null) return false;

            request.Processed = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
