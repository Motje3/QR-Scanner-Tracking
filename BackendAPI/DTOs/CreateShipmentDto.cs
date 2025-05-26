// In DTOs/CreateShipmentDto.cs
using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class CreateShipmentDto
    {
        [Required(ErrorMessage = "Status is required.")]
        [StringLength(100, ErrorMessage = "Status cannot be longer than 100 characters.")]
        public required string Status { get; set; }

        [StringLength(255, ErrorMessage = "Destination cannot be longer than 255 characters.")]
        public string? Destination { get; set; }

        [StringLength(100, ErrorMessage = "AssignedTo cannot be longer than 100 characters.")]
        public string? AssignedTo { get; set; }

        [StringLength(50, ErrorMessage = "ExpectedDelivery cannot be longer than 50 characters.")]
        public string? ExpectedDelivery { get; set; }

        [StringLength(50, ErrorMessage = "Weight cannot be longer than 50 characters.")]
        public string? Weight { get; set; }

        [StringLength(50, ErrorMessage = "Revenue cannot be longer than 50 characters.")]
        public decimal? Omzet { get; set; }
    }
}