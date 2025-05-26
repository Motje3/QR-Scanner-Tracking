// In backend_api/Services/IIssueReportService.cs

using BackendAPI.Models;
using BackendAPI.DTOs; // Don't forget to add this using statement
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendAPI.Services
{
    public interface IIssueReportService
    {
        Task<IEnumerable<IssueReport>> GetAllAsync();
        Task<IssueReport> CreateAsync(IssueReport report);
        Task<IEnumerable<IssueReport>> GetByShipmentIdAsync(int shipmentId);
        Task<IssueReport?> UpdateAsync(int id, UpdateIssueReportDto dto); // NEW: Update method
    }
}