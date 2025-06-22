// Models/UserSettings.cs
using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Models
{
    public class UserSettings
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int ProfileId { get; set; } // Foreign key to Profile
        
        // Personal Information
        public string? FullName { get; set; }
        public string? Email { get; set; }
        
        // Notifications
        public bool EmailNotifications { get; set; } = true;
        public bool PushNotifications { get; set; } = true;
        public bool MonthlyReport { get; set; } = true;
        
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public virtual Profile Profile { get; set; } = null!;
    }
}