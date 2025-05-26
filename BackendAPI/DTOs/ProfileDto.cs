using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class UpdateProfileDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string ImageUrl { get; set; } = string.Empty;
    }
}
