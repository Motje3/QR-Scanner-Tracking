using System.ComponentModel.DataAnnotations;

namespace backend_api.Models
{
    public class IssueReport
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public required string Title { get; set; }

        public string? Description { get; set; }

        public string? ImageUrl { get; set; } // Optional image path or URL

        public int? ShipmentId { get; set; }  // Optional link to scanned shipment
        public Shipment? Shipment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
