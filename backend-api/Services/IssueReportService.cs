using backend_api.Data;
using backend_api.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_api.Services
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
                .OrderBy(i => i.CreatedAt)
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
    }
}
