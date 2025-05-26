namespace BackendAPI.DTOs
{
    public class UpdateIssueReportDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int? ShipmentId { get; set; }
        public bool? IsImportant { get; set; } // Nullable to indicate if it's being updated
        public bool? IsFixed { get; set; }     // Nullable to indicate if it's being updated
        public DateTime? ResolvedAt { get; set; } // Nullable to indicate if it's being updated
    }
}