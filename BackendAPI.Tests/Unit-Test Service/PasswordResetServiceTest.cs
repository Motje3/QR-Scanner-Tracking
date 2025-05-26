using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BackendAPI.Data;
using BackendAPI.DTOs;
using BackendAPI.Models;
using BackendAPI.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BackendAPI.Tests.TestService
{
    public class PasswordResetServiceTests
    {
        private readonly PasswordResetService _service;
        private readonly AppDbContext _context;

        public PasswordResetServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _service = new PasswordResetService(_context);
        }

        // ---------------- CREATE ----------------

        [Fact]
        public async Task CreateAsync_CreatesRequestWithValidData()
        {
            var dto = new PasswordResetRequestDto
            {
                Email = "test@example.com",
                NewPassword = "NewPass123"
            };

            var result = await _service.CreateAsync(dto);

            Assert.NotNull(result);
            Assert.Equal(dto.Email, result.Email);
            Assert.Equal(dto.NewPassword, result.RequestedNewPassword);
            Assert.False(result.Processed);
        }

        [Fact]
        public async Task CreateAsync_SetsRequestedAtWithinValidRange()
        {
            var dto = new PasswordResetRequestDto { Email = "timing@test.com", NewPassword = "123" };
            var before = DateTime.UtcNow;

            var result = await _service.CreateAsync(dto);
            var after = DateTime.UtcNow;

            Assert.InRange(result.RequestedAt, before, after);
        }

        [Fact]
        public async Task CreateAsync_TrimsEmail()
        {
            var dto = new PasswordResetRequestDto
            {
                Email = "  spaced@test.com  ",
                NewPassword = "trim123"
            };

            var result = await _service.CreateAsync(dto);
            Assert.Equal("spaced@test.com", result.Email);
        }

        [Fact]
        public async Task CreateAsync_Throws_WhenDtoIsNull()
        {
            await Assert.ThrowsAsync<ArgumentNullException>(() => _service.CreateAsync(null!));
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        public async Task CreateAsync_Throws_WhenEmailIsInvalid(string? email)
        {
            var dto = new PasswordResetRequestDto { Email = email!, NewPassword = "abc123" };
            await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateAsync(dto));
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        public async Task CreateAsync_Throws_WhenPasswordIsInvalid(string? pwd)
        {
            var dto = new PasswordResetRequestDto { Email = "x@x.com", NewPassword = pwd! };
            await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateAsync(dto));
        }

        [Fact]
        public async Task CreateAsync_AllowsDuplicateEmail()
        {
            var dto = new PasswordResetRequestDto
            {
                Email = "dup@example.com",
                NewPassword = "one"
            };

            await _service.CreateAsync(dto);
            await _service.CreateAsync(dto);

            var all = await _context.PasswordResetRequests.Where(r => r.Email == "dup@example.com").ToListAsync();
            Assert.Equal(2, all.Count);
        }

        [Fact]
        public async Task CreateAsync_PersistsToDatabase()
        {
            var dto = new PasswordResetRequestDto { Email = "store@ex.com", NewPassword = "1234" };
            await _service.CreateAsync(dto);

            var exists = await _context.PasswordResetRequests.AnyAsync(r => r.Email == "store@ex.com");
            Assert.True(exists);
        }

        [Fact]
        public async Task CreateAsync_AllowsLongStrings()
        {
            var longEmail = new string('a', 1000) + "@example.com";
            var longPwd = new string('x', 1000);
            var dto = new PasswordResetRequestDto { Email = longEmail, NewPassword = longPwd };

            var result = await _service.CreateAsync(dto);
            Assert.Equal(longEmail, result.Email);
            Assert.Equal(longPwd, result.RequestedNewPassword);
        }

        // ---------------- GET ALL ----------------

        [Fact]
        public async Task GetAllAsync_ReturnsEmptyListWhenNoneExist()
        {
            var result = await _service.GetAllAsync();
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetAllAsync_ReturnsAllRequests()
        {
            _context.PasswordResetRequests.AddRange(
                new PasswordResetRequest { Email = "1@x.com", RequestedNewPassword = "a", RequestedAt = DateTime.UtcNow },
                new PasswordResetRequest { Email = "2@x.com", RequestedNewPassword = "b", RequestedAt = DateTime.UtcNow }
            );
            await _context.SaveChangesAsync();

            var result = (await _service.GetAllAsync()).ToList();
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task GetAllAsync_ReturnsCorrectData()
        {
            var request = new PasswordResetRequest { Email = "x@y.com", RequestedNewPassword = "pass", RequestedAt = DateTime.UtcNow };
            _context.PasswordResetRequests.Add(request);
            await _context.SaveChangesAsync();

            var result = (await _service.GetAllAsync()).ToList();
            Assert.Contains(result, r => r.Email == "x@y.com" && r.RequestedNewPassword == "pass");
        }

        // ---------------- MARK AS PROCESSED ----------------

        [Fact]
        public async Task MarkAsProcessed_ReturnsTrueWhenFound()
        {
            var req = new PasswordResetRequest { Email = "mark@me.com", RequestedNewPassword = "pass", RequestedAt = DateTime.UtcNow };
            _context.PasswordResetRequests.Add(req);
            await _context.SaveChangesAsync();

            var result = await _service.MarkAsProcessed(req.Id);

            Assert.True(result);
            var updated = await _context.PasswordResetRequests.FindAsync(req.Id);
            Assert.True(updated?.Processed);
        }

        [Fact]
        public async Task MarkAsProcessed_ReturnsFalseWhenNotFound()
        {
            var result = await _service.MarkAsProcessed(999);
            Assert.False(result);
        }

        [Fact]
        public async Task MarkAsProcessed_DoesNotChangeOtherFields()
        {
            var req = new PasswordResetRequest
            {
                Email = "data@stay.com",
                RequestedNewPassword = "pass123",
                RequestedAt = DateTime.UtcNow
            };

            _context.PasswordResetRequests.Add(req);
            await _context.SaveChangesAsync();

            await _service.MarkAsProcessed(req.Id);

            var updated = await _context.PasswordResetRequests.FindAsync(req.Id);
            Assert.Equal("data@stay.com", updated?.Email);
            Assert.Equal("pass123", updated?.RequestedNewPassword);
            Assert.True(updated?.Processed);
        }

        [Theory]
        [InlineData(-1)]
        [InlineData(0)]
        [InlineData(99999)]
        public async Task MarkAsProcessed_ReturnsFalseForInvalidIds(int id)
        {
            var result = await _service.MarkAsProcessed(id);
            Assert.False(result);
        }

        [Fact]
        public async Task MarkAsProcessed_DoesNotResetAlreadyProcessed()
        {
            var req = new PasswordResetRequest
            {
                Email = "done@x.com",
                RequestedNewPassword = "pass",
                RequestedAt = DateTime.UtcNow,
                Processed = true
            };

            _context.PasswordResetRequests.Add(req);
            await _context.SaveChangesAsync();

            var result = await _service.MarkAsProcessed(req.Id);
            Assert.True(result);

            var updated = await _context.PasswordResetRequests.FindAsync(req.Id);
            Assert.True(updated?.Processed);
        }

        [Fact]
        public async Task MarkAsProcessed_CalledTwice_ShouldRemainTrue()
        {
            var req = new PasswordResetRequest
            {
                Email = "multi@x.com",
                RequestedNewPassword = "pass",
                RequestedAt = DateTime.UtcNow,
                Processed = false
            };

            _context.PasswordResetRequests.Add(req);
            await _context.SaveChangesAsync();

            await _service.MarkAsProcessed(req.Id);
            await _service.MarkAsProcessed(req.Id);

            var updated = await _context.PasswordResetRequests.FindAsync(req.Id);
            Assert.True(updated?.Processed);
        }

        // ---------------- EDGE / ERROR CASES ----------------

        [Fact]
        public async Task CreateAsync_Throws_IfSaveChangesFails()
        {
            var badContext = new FailingDbContext();
            var service = new PasswordResetService(badContext);

            var dto = new PasswordResetRequestDto { Email = "fail@test.com", NewPassword = "oops" };

            await Assert.ThrowsAsync<InvalidOperationException>(() => service.CreateAsync(dto));
        }

        // Helper class for simulating failure
        private class FailingDbContext : AppDbContext
        {
            public FailingDbContext() : base(new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options) { }

            public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
            {
                throw new InvalidOperationException("Simulated DB failure");
            }
        }
    }
}
