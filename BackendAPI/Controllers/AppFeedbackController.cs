using BackendAPI.Services;
using BackendAPI.DTOs;
using BackendAPI.Models;
using Microsoft.AspNetCore.Mvc;

namespace BackendAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppFeedbackController : ControllerBase
    {
        private readonly IAppFeedbackService _feedbackService;

        public AppFeedbackController(IAppFeedbackService feedbackService)
        {
            _feedbackService = feedbackService ?? throw new ArgumentNullException(nameof(feedbackService));
        }

        // POST: api/AppFeedback
        [HttpPost]
        public async Task<ActionResult<AppFeedback>> SubmitFeedback([FromBody] CreateAppFeedbackDto feedbackDto)
        {

            try
            {
                var newFeedback = new AppFeedback
                {
                    OverallRating = feedbackDto.OverallRating,
                    BestFeature = feedbackDto.BestFeature?.Trim(),
                    MissingFeature = feedbackDto.MissingFeature?.Trim(),
                    Suggestions = feedbackDto.Suggestions?.Trim(),
                    WouldRecommend = feedbackDto.WouldRecommend,
                    SubmittedAt = DateTime.UtcNow

                };

                var createdFeedback = await _feedbackService.CreateFeedbackAsync(newFeedback);


                return Ok(createdFeedback);

            }
            catch (ArgumentNullException ex) // Catch specific exceptions if needed
            {
                // This might happen if the service layer throws it, though unlikely with DTO validation.
                return BadRequest(new ProblemDetails { Title = "Invalid input", Detail = ex.Message });
            }
            catch (Exception ex) // Catch-all for unexpected errors
            {
                // Log the exception ex here
                Console.WriteLine($"Error submitting feedback: {ex.Message}"); // Basic console logging
                return StatusCode(500, new ProblemDetails { Title = "An unexpected error occurred.", Detail = "We're working on fixing it. Please try again later." });
            }
        }

        // GET: api/AppFeedback
        [HttpGet]
        // [Authorize(Roles = "Admin")] // Example: Only Admins can get all feedback
        public async Task<ActionResult<IEnumerable<AppFeedback>>> GetAllFeedback()
        {
            try
            {
                var allFeedback = await _feedbackService.GetAllFeedbackAsync();
                return Ok(allFeedback ?? new List<AppFeedback>()); // Return empty list if null
            }
            catch (Exception ex)
            {
                // Log the exception ex here
                Console.WriteLine($"Error retrieving feedback: {ex.Message}");
                return StatusCode(500, new ProblemDetails { Title = "An unexpected error occurred while retrieving feedback." });
            }
        }


    }
}
