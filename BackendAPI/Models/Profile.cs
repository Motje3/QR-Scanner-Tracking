using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Models
{
    public class Profile
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public required string Username { get; set; }

        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        public required string FullName { get; set; }

        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string ImageUrl { get; set; } = string.Empty;

        public string Role { get; set; } = "user";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string AccentColor { get; set; } = "#A970FF";
        public bool DarkMode { get; set; } = true;
        public bool NotificationsEnabled { get; set; } = true;

    }
}
