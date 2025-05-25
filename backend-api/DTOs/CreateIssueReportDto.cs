using System.ComponentModel.DataAnnotations;

namespace backend_api.DTOs
{
    public class CreateIssueReportDto
    {
        public required string Title { get; set; }

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public int? ShipmentId { get; set; }
    }
}
