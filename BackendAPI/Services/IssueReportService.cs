// In backend_api/Services/IssueReportService.cs

using BackendAPI.Data;
using BackendAPI.Models;
using BackendAPI.DTOs; // Don't forget to add this using statement
using Microsoft.EntityFrameworkCore;
using System; // Required for DateTime and ArgumentNullException

namespace BackendAPI.Services
{
    public class IssueReportService : IIssueReportService
    {
        private readonly AppDbContext _context;

        public IssueReportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<IssueReport>> GetAllAsync()
        {
            return await _context.IssueReports
                .Include(r => r.Shipment)
                .OrderByDescending(i => i.CreatedAt) // Often helpful to order by newest first
                .ToListAsync();
        }

        public async Task<IEnumerable<IssueReport>> GetByShipmentIdAsync(int shipmentId)
        {
            return await _context.IssueReports
                .Where(r => r.ShipmentId == shipmentId)
                .OrderByDescending(i => i.CreatedAt) // Order by newest first
                .ToListAsync();
        }

        public async Task<IssueReport> CreateAsync(IssueReport report)
        {
            if (report == null)
                throw new ArgumentNullException(nameof(report));

            _context.IssueReports.Add(report);
            await _context.SaveChangesAsync();
            return report;
        }

        // NEW IMPLEMENTATION: Update IssueReport
        public async Task<IssueReport?> UpdateAsync(int id, UpdateIssueReportDto dto)
        {
            var existingReport = await _context.IssueReports.FindAsync(id);

            if (existingReport == null)
            {
                return null; // Not found
            }

            // Apply updates only if the DTO property has a value
            if (dto.Title != null) existingReport.Title = dto.Title.Trim();
            if (dto.Description != null) existingReport.Description = dto.Description.Trim();
            if (dto.ImageUrl != null) existingReport.ImageUrl = dto.ImageUrl.Trim();
            if (dto.ShipmentId.HasValue) existingReport.ShipmentId = dto.ShipmentId.Value;

            // NEW: Update IsImportant, IsFixed, and ResolvedAt
            if (dto.IsImportant.HasValue) existingReport.IsImportant = dto.IsImportant.Value;
            if (dto.IsFixed.HasValue)
            {
                existingReport.IsFixed = dto.IsFixed.Value;
                // Only update ResolvedAt if IsFixed is true and it's being marked true
                // Or if it's being marked false, set ResolvedAt to null
                if (dto.IsFixed.Value)
                {
                    existingReport.ResolvedAt = dto.ResolvedAt ?? DateTime.UtcNow; // Use DTO value or current UTC time
                }
                else
                {
                    existingReport.ResolvedAt = null;
                }
            }
            else if (dto.ResolvedAt.HasValue)
            {
                // If only ResolvedAt is provided, but IsFixed isn't explicitly set,
                // assume it's meant to be fixed if a ResolvedAt value is provided.
                existingReport.ResolvedAt = dto.ResolvedAt.Value;
                existingReport.IsFixed = true;
            }


            await _context.SaveChangesAsync();
            return existingReport;
        }
        public async Task<IEnumerable<IssueReport>> GetByAssignedUserAsync(string assignedTo)
        {
            return await _context.IssueReports
                .Include(r => r.Shipment)
                .Where(r => r.Shipment != null && r.Shipment.AssignedTo == assignedTo)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }
    }
}