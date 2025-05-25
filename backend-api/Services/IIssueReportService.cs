// In backend_api/Services/IIssueReportService.cs

using backend_api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend_api.Services
{
    public interface IIssueReportService
    {
        Task<IEnumerable<IssueReport>> GetAllAsync();
        Task<IssueReport> CreateAsync(IssueReport report);
        Task<IEnumerable<IssueReport>> GetByShipmentIdAsync(int shipmentId); // NEW: Get by ShipmentId
    }
}