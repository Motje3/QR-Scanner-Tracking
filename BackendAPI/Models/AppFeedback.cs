using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Models 
{
    public class AppFeedback
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Overall rating must be between 1 and 5.")]
        public int OverallRating { get; set; } // From the star rating

        [MaxLength(1000, ErrorMessage = "Best feature description cannot exceed 1000 characters.")]
        public string? BestFeature { get; set; } // "Wat vindt u het beste aan de app?"

        [MaxLength(1000, ErrorMessage = "Missing feature description cannot exceed 1000 characters.")]
        public string? MissingFeature { get; set; } // "Zijn er functies die u mist..."

        [MaxLength(2000, ErrorMessage = "Suggestions cannot exceed 2000 characters.")]
        public string? Suggestions { get; set; }

        public bool? WouldRecommend { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        
    }
}
