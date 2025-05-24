using backend_api.Models; // Namespace for AppFeedback model
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend_api.Services 
{
    public interface IAppFeedbackService
    {
        Task<AppFeedback> CreateFeedbackAsync(AppFeedback feedback);
        Task<IEnumerable<AppFeedback>> GetAllFeedbackAsync(); 
    }
}
