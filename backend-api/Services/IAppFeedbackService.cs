using backend_api.Models; // Namespace for AppFeedback model
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend_api.Services // Ensure this namespace matches your project structure
{
    public interface IAppFeedbackService
    {
        Task<AppFeedback> CreateFeedbackAsync(AppFeedback feedback);
        Task<IEnumerable<AppFeedback>> GetAllFeedbackAsync(); // Optional: if you want to retrieve feedback
        // Add other methods here if needed, e.g., GetFeedbackByIdAsync, UpdateFeedbackAsync, DeleteFeedbackAsync
    }
}
