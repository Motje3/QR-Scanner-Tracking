using Microsoft.EntityFrameworkCore;
using backend_api.Models;

namespace backend_api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }


        public DbSet<Shipment> Shipments { get; set; }
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<IssueReport> IssueReports { get; set; }
        public DbSet<PasswordResetRequest> PasswordResetRequests { get; set; }
        public DbSet<AppFeedback> AppFeedbacks { get; set; }

    }
}
