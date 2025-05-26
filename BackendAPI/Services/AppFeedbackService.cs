using BackendAPI.Data; // Namespace for AppDbContext
using BackendAPI.Models; // Namespace for AppFeedback model
using Microsoft.EntityFrameworkCore; // For ToListAsync, etc.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendAPI.Services
{
    public class AppFeedbackService : IAppFeedbackService
    {
        private readonly AppDbContext _context;

        public AppFeedbackService(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<AppFeedback> CreateFeedbackAsync(AppFeedback feedback)
        {
            if (feedback == null)
            {
                throw new ArgumentNullException(nameof(feedback));
            }

            if (feedback.SubmittedAt == default)
            {
                feedback.SubmittedAt = DateTime.UtcNow;
            }

            _context.AppFeedbacks.Add(feedback);
            await _context.SaveChangesAsync();
            return feedback;
        }

        public async Task<IEnumerable<AppFeedback>> GetAllFeedbackAsync()
        {
            return await _context.AppFeedbacks
                                 .OrderByDescending(f => f.SubmittedAt)
                                 .ToListAsync();
        }

    }
}
