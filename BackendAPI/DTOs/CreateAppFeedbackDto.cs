using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class CreateAppFeedbackDto
    {
        [Required(ErrorMessage = "Overall rating is required.")]
        [Range(1, 5, ErrorMessage = "Overall rating must be between 1 and 5.")]
        public int OverallRating { get; set; }

        [MaxLength(1000, ErrorMessage = "Best feature description cannot exceed 1000 characters.")]
        public string? BestFeature { get; set; }

        [MaxLength(1000, ErrorMessage = "Missing feature description cannot exceed 1000 characters.")]
        public string? MissingFeature { get; set; }

        [MaxLength(2000, ErrorMessage = "Suggestions cannot exceed 2000 characters.")]
        public string? Suggestions { get; set; }

        public bool? WouldRecommend { get; set; }

    }
}
