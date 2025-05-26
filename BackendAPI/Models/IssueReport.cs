// In backend_api/Models/IssueReport.cs

using System.ComponentModel.DataAnnotations;

namespace BackendAPI.Models
{
    public class IssueReport
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public required string Title { get; set; }

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public int? ShipmentId { get; set; }
        public Shipment? Shipment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // NEW PROPERTIES FOR PERSISTENCE
        public bool IsImportant { get; set; } = false; // Default to false
        public bool IsFixed { get; set; } = false;     // Default to false
        public DateTime? ResolvedAt { get; set; }      // Nullable DateTime for when it was fixed
    }
}