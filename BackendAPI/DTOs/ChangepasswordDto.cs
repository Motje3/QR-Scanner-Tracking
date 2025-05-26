using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class ChangePasswordDto
    {
        [Required]
        public string OldPassword { get; set; } = string.Empty;

        [Required]
        [MinLength(6, ErrorMessage = "Nieuw wachtwoord moet minimaal 6 tekens bevatten")]
        public string NewPassword { get; set; } = string.Empty;
    }
}
