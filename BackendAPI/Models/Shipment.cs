using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Models
{
    public class Shipment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string? Status { get; set; }

        public string? Destination { get; set; }

        public string? AssignedTo { get; set; }

        public string? ExpectedDelivery { get; set; }

        public string? Weight { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? LastUpdatedBy { get; set; }

        public DateTime? LastUpdatedAt { get; set; }

        public decimal? Omzet { get; set; } // Optional revenue
    }
}
