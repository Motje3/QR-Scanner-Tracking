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
    public class ShipmentServiceTests
    {
        private readonly ShipmentService _service;
        private readonly AppDbContext _context;

        public ShipmentServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _service = new ShipmentService(_context);
        }

        // ---------------- Constructor ----------------
        [Fact]
        public void Constructor_Throws_WhenContextIsNull()
        {
            var ex = Record.Exception(() => new ShipmentService(null!));
            Assert.NotNull(ex);
            Assert.IsType<ArgumentNullException>(ex);
            Assert.Equal("context", ((ArgumentNullException)ex).ParamName);
        }

        // ---------------- GetAllShipmentsAsync ---------- ------
        [Fact]
        public async Task GetAllShipmentsAsync_ReturnsEmpty_WhenNoneExist()
        {
            var result = await _service.GetAllShipmentsAsync();
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetAllShipmentsAsync_ReturnsAllShipments()
        {
            _context.Shipments.AddRange(
                new Shipment { AssignedTo = "user1", Status = "Delivered" },
                new Shipment { AssignedTo = "user2", Status = "Pending" }
            );
            await _context.SaveChangesAsync();

            var result = await _service.GetAllShipmentsAsync();
            Assert.Equal(2, result.Count());
        }

        // ---------------- GetShipmentByIdAsync ----------------
        [Fact]
        public async Task GetShipmentByIdAsync_ReturnsShipment_WhenExists()
        {
            var shipment = new Shipment { AssignedTo = "user", Status = "In Transit" };
            _context.Shipments.Add(shipment);
            await _context.SaveChangesAsync();

            var result = await _service.GetShipmentByIdAsync(shipment.Id);
            Assert.NotNull(result);
            Assert.Equal("In Transit", result?.Status);
        }

        [Fact]
        public async Task GetShipmentByIdAsync_ReturnsNull_WhenNotFound()
        {
            var result = await _service.GetShipmentByIdAsync(999);
            Assert.Null(result);
        }

        // ---------------- UpdateStatusAsync ----------------
        [Fact]
        public async Task UpdateStatusAsync_UpdatesStatusCorrectly()
        {
            var shipment = new Shipment { AssignedTo = "admin", Status = "Pending" };
            _context.Shipments.Add(shipment);
            await _context.SaveChangesAsync();

            var updated = await _service.UpdateStatusAsync(shipment.Id, "Delivered", "system");

            Assert.NotNull(updated);
            Assert.Equal("Delivered", updated!.Status);
            Assert.Equal("system", updated.LastUpdatedBy);
            Assert.True((DateTime.UtcNow - updated.LastUpdatedAt!.Value).TotalSeconds < 5);
        }

        [Fact]
        public async Task UpdateStatusAsync_ReturnsNull_WhenShipmentNotFound()
        {
            var result = await _service.UpdateStatusAsync(9999, "Lost", "system");
            Assert.Null(result);
        }

        [Fact]
        public async Task UpdateStatusAsync_DoesNotAffectOtherShipments()
        {
            var s1 = new Shipment { AssignedTo = "one", Status = "Old" };
            var s2 = new Shipment { AssignedTo = "two", Status = "Old" };
            _context.Shipments.AddRange(s1, s2);
            await _context.SaveChangesAsync();

            await _service.UpdateStatusAsync(s1.Id, "Updated", "system");

            var unaffected = await _context.Shipments.FindAsync(s2.Id);
            Assert.Equal("Old", unaffected?.Status);
        }

        // ---------------- GetShipmentsForUserAsync ----------------
        [Fact]
        public async Task GetShipmentsForUserAsync_ReturnsCorrectUserShipments()
        {
            _context.Shipments.AddRange(
                new Shipment { AssignedTo = "alice", Status = "Delivered" },
                new Shipment { AssignedTo = "alice", Status = "Pending" },
                new Shipment { AssignedTo = "bob", Status = "Delivered" }
            );
            await _context.SaveChangesAsync();

            var result = await _service.GetShipmentsForUserAsync("alice");
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task GetShipmentsForUserAsync_ReturnsEmpty_WhenUserHasNone()
        {
            var result = await _service.GetShipmentsForUserAsync("ghost");
            Assert.Empty(result);
        }

        // ---------------- GetShipmentsForUserAsync with Date ----------------
       [Fact]
        public async Task GetShipmentsForUserAsync_ByDate_ReturnsMatchingDate()
        {
            var today = DateTime.UtcNow.Date;

            _context.Shipments.AddRange(
                new Shipment { AssignedTo = "driver", ExpectedDelivery = today.ToString("yyyy-MM-dd"), Status = "Pending" },
                new Shipment { AssignedTo = "driver", ExpectedDelivery = today.AddDays(1).ToString("yyyy-MM-dd"), Status = "Planned" }
            );
            await _context.SaveChangesAsync();

            var result = await _service.GetShipmentsForUserAsync("driver", today);

            Assert.Single(result);
        }


        [Fact]
        public async Task GetShipmentsForUserAsync_ByDate_IgnoresInvalidDates()
        {
            _context.Shipments.Add(new Shipment
            {
                AssignedTo = "driver",
                ExpectedDelivery = "not-a-date",
                Status = "InvalidDate"
            });

            await _context.SaveChangesAsync();

            var result = await _service.GetShipmentsForUserAsync("driver", DateTime.UtcNow.Date);
            Assert.Empty(result);
        }

        // ---------------- Performance test ----------------
        [Fact]
        public async Task GetShipmentsForUserAsync_PerformsWithLargeDataset()
        {
            for (int i = 0; i < 10000; i++)
            {
                _context.Shipments.Add(new Shipment
                {
                    AssignedTo = "bulkuser",
                    Status = "In Transit"
                });
            }
            await _context.SaveChangesAsync();

            var result = await _service.GetShipmentsForUserAsync("bulkuser");
            Assert.Equal(10000, result.Count());
        }
    }
}
