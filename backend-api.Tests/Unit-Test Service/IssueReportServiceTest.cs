using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend_api.Data;
using backend_api.Models;
using backend_api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace backend_api.Tests.TestService
{
    public class IssueReportServiceTests
    {
        private readonly IssueReportService _service;
        private readonly AppDbContext _context;

        public IssueReportServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _service = new IssueReportService(_context);
        }

        [Fact]
        public async Task GetAllAsync_ReturnsEmptyList_WhenNoReportsExist()
        {
            var result = await _service.GetAllAsync();
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetAllAsync_ReturnsReports_OrderedByCreatedAt()
        {
            _context.IssueReports.AddRange(
                new IssueReport { Id = 1, Title = "Old", CreatedAt = new DateTime(2023, 1, 1) },
                new IssueReport { Id = 2, Title = "New", CreatedAt = new DateTime(2024, 1, 1) }
            );
            await _context.SaveChangesAsync();

            var result = await _service.GetAllAsync();

            Assert.Equal(2, result.Count());
            Assert.Equal("Old", result.First().Title);
        }

        [Fact]
        public async Task GetAllAsync_IncludesShipmentData()
        {
            var shipment = new Shipment
            {
                Id = 1,
                Destination = "Berlin",
                Status = "Pending"
            };

            var report = new IssueReport
            {
                Title = "With Shipment",
                Shipment = shipment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Shipments.Add(shipment);
            _context.IssueReports.Add(report);
            await _context.SaveChangesAsync();

            var result = (await _service.GetAllAsync()).ToList();

            var firstShipment = result.FirstOrDefault()?.Shipment;

            Assert.NotNull(firstShipment);
            Assert.Equal("Berlin", firstShipment?.Destination);
        }

        [Fact]
        public async Task CreateAsync_AddsNewReport()
        {
            var report = new IssueReport { Id = 1, Title = "Test Report" };

            var result = await _service.CreateAsync(report);
            var reportsInDb = await _context.IssueReports.ToListAsync();

            Assert.Single(reportsInDb);
            Assert.Equal("Test Report", result.Title);
        }

        [Fact]
        public async Task CreateAsync_SavesCreatedAt_WhenProvided()
        {
            var createdAt = DateTime.UtcNow.AddDays(-1);
            var report = new IssueReport { CreatedAt = createdAt, Title = "Timed Report" };

            var result = await _service.CreateAsync(report);
            Assert.Equal(createdAt, result.CreatedAt);
        }

        [Fact]
        public async Task CreateAsync_SavesTitleCorrectly()
        {
            var report = new IssueReport { Title = "Critical bug" };

            var result = await _service.CreateAsync(report);
            var saved = await _context.IssueReports.FirstOrDefaultAsync();

            Assert.NotNull(saved);
            Assert.Equal("Critical bug", saved?.Title);
        }

        [Fact]
        public async Task CreateAsync_AllowsMultipleReportsWithSameTitle()
        {
            var report1 = new IssueReport { Title = "Duplicate" };
            var report2 = new IssueReport { Title = "Duplicate" };

            await _service.CreateAsync(report1);
            await _service.CreateAsync(report2);

            var all = await _context.IssueReports.Where(r => r.Title == "Duplicate").ToListAsync();
            Assert.Equal(2, all.Count);
        }

        [Fact]
        public async Task CreateAsync_ThrowsException_WhenReportIsNull()
        {
            await Assert.ThrowsAsync<ArgumentNullException>(() => _service.CreateAsync(null!));
        }

        [Fact]
        public async Task CreateAsync_CanHandleEmptyTitle()
        {
            var report = new IssueReport { Title = string.Empty };
            var result = await _service.CreateAsync(report);

            Assert.NotNull(result);
            Assert.Equal(string.Empty, result.Title);
        }

        [Fact]
        public async Task CreateAsync_CanHandleLongTitle()
        {
            var longTitle = new string('A', 5000);
            var report = new IssueReport { Title = longTitle };
            var result = await _service.CreateAsync(report);

            Assert.Equal(longTitle, result.Title);
        }

        [Fact]
        public async Task CreateAsync_SetsDefaultCreatedAt_IfNotProvided()
        {
            var report = new IssueReport { Title = "No date" };
            var result = await _service.CreateAsync(report);

            Assert.NotEqual(default, result.CreatedAt);
        }

        [Fact]
        public async Task GetAllAsync_CanHandleLargeNumberOfReports()
        {
            for (int i = 0; i < 1000; i++)
            {
                _context.IssueReports.Add(new IssueReport { Title = $"Report {i}", CreatedAt = DateTime.UtcNow.AddMinutes(i) });
            }

            await _context.SaveChangesAsync();
            var result = await _service.GetAllAsync();

            Assert.Equal(1000, result.Count());
        }

        [Fact]
        public async Task GetAllAsync_ReportsAreSortedCorrectlyEvenIfCreatedAtIsIdentical()
        {
            var now = DateTime.UtcNow;
            _context.IssueReports.AddRange(
                new IssueReport { Title = "B", CreatedAt = now },
                new IssueReport { Title = "A", CreatedAt = now }
            );
            await _context.SaveChangesAsync();

            var result = (await _service.GetAllAsync()).ToList();

            Assert.Equal(2, result.Count);
            Assert.Equal("B", result[0].Title); // sorting is stable, assumes insert order preserved
        }

        [Fact]
        public async Task CreateAsync_PersistsMultipleDifferentReports()
        {
            var reports = new[]
            {
                new IssueReport { Title = "First" },
                new IssueReport { Title = "Second" },
                new IssueReport { Title = "Third" }
            };

            foreach (var r in reports)
                await _service.CreateAsync(r);

            var all = await _context.IssueReports.ToListAsync();
            Assert.Equal(3, all.Count);
        }

        [Fact]
        public async Task GetAllAsync_ReturnsCorrectShipment_WhenMultipleReportsExist()
        {
            var shipment1 = new Shipment { Destination = "Paris", Status = "Delivered" };
            var shipment2 = new Shipment { Destination = "Rome", Status = "Pending" };

            _context.IssueReports.AddRange(
                new IssueReport { Title = "One", Shipment = shipment1, CreatedAt = DateTime.UtcNow },
                new IssueReport { Title = "Two", Shipment = shipment2, CreatedAt = DateTime.UtcNow }
            );

            await _context.SaveChangesAsync();

            var result = (await _service.GetAllAsync()).ToList();
            Assert.Contains(result, r => r.Shipment?.Destination == "Paris");
            Assert.Contains(result, r => r.Shipment?.Destination == "Rome");
        }

        [Fact]
        public async Task CreateAsync_CanHandleReportWithMinimumDate()
        {
            var report = new IssueReport
            {
                Title = "Ancient",
                CreatedAt = DateTime.MinValue
            };

            var result = await _service.CreateAsync(report);
            Assert.Equal(DateTime.MinValue, result.CreatedAt);
        }

        [Fact]
        public async Task CreateAsync_DoesNotThrow_OnValidData()
        {
            var report = new IssueReport { Title = "Stable" };
            var ex = await Record.ExceptionAsync(() => _service.CreateAsync(report));

            Assert.Null(ex);
        }

        [Fact]
        public async Task GetAllAsync_ReturnsSameCountAsDatabase()
        {
            _context.IssueReports.AddRange(
                new IssueReport { Title = "One", CreatedAt = DateTime.UtcNow },
                new IssueReport { Title = "Two", CreatedAt = DateTime.UtcNow }
            );
            await _context.SaveChangesAsync();

            var result = await _service.GetAllAsync();
            var count = await _context.IssueReports.CountAsync();

            Assert.Equal(count, result.Count());
        }
    }
}
