using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // Required for ProfileId if you add it

namespace backend_api.Models // Ensure this namespace matches your project structure
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
        public string? Suggestions { get; set; } // "Heeft u suggesties..."

        public bool? WouldRecommend { get; set; } // "Zou u deze app aanbevelen..." (true for Yes, false for No, null if not answered)

        // Optional: Link to the user who submitted the feedback
        // public string? UserId { get; set; } // If you use string User IDs from ASP.NET Core Identity
        // public Guid? ProfileId { get; set; } // If you have a separate Profile model with Guid Id
        // [ForeignKey("ProfileId")]
        // public Profile? Profile { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        // Constructor can be added if needed, for example, to ensure SubmittedAt is always set.
        // public AppFeedback()
        // {
        //     SubmittedAt = DateTime.UtcNow;
        // }
    }
}
