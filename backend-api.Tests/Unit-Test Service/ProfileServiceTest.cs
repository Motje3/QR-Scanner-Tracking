using System;
using System.Linq;
using System.Threading.Tasks;
using backend_api.Data;
using backend_api.DTOs;
using backend_api.Models;
using backend_api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace backend_api.Tests.TestService
{
    public class ProfileServiceTests
    {
        private readonly AppDbContext _context;
        private readonly ProfileService _service;

        public ProfileServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _service = new ProfileService(_context);
        }

        // ---------- Constructor ----------
        [Fact]
        public void Constructor_Throws_WhenContextIsNull()
        {
            var ex = Record.Exception(() => new ProfileService(null!));
            Assert.NotNull(ex);
            Assert.IsType<ArgumentNullException>(ex);
            Assert.Equal("context", ((ArgumentNullException)ex).ParamName);
        }

        // ---------- LoginAsync ----------
        [Fact]
        public async Task LoginAsync_ReturnsProfile_WhenCredentialsMatch()
        {
            _context.Profiles.Add(new Profile { Username = "user1", Password = "pass", FullName = "User One" });
            await _context.SaveChangesAsync();

            var result = await _service.LoginAsync("user1", "pass");

            Assert.NotNull(result);
            Assert.Equal("user1", result!.Username);
        }

        [Fact]
        public async Task LoginAsync_ReturnsNull_WhenUsernameIncorrect()
        {
            var result = await _service.LoginAsync("nouser", "pass");
            Assert.Null(result);
        }

        [Fact]
        public async Task LoginAsync_ReturnsNull_WhenPasswordIncorrect()
        {
            _context.Profiles.Add(new Profile { Username = "user2", Password = "correct", FullName = "User Two" });
            await _context.SaveChangesAsync();

            var result = await _service.LoginAsync("user2", "wrong");
            Assert.Null(result);
        }

        [Theory]
        [InlineData(null, "pass")]
        [InlineData("user", null)]
        [InlineData(null, null)]
        public async Task LoginAsync_HandlesNulls(string username, string password)
        {
            var result = await _service.LoginAsync(username!, password!);
            Assert.Null(result);
        }

        // ---------- GetProfileAsync ----------
        [Fact]
        public async Task GetProfileAsync_ReturnsProfile_WhenIdExists()
        {
            var profile = new Profile { Username = "getuser", FullName = "Test", Password = "abc" };
            _context.Profiles.Add(profile);
            await _context.SaveChangesAsync();

            var result = await _service.GetProfileAsync(profile.Id);
            Assert.NotNull(result);
        }

        [Theory]
        [InlineData(-1)]
        [InlineData(0)]
        [InlineData(999)]
        public async Task GetProfileAsync_ReturnsNull_WhenIdInvalid(int id)
        {
            var result = await _service.GetProfileAsync(id);
            Assert.Null(result);
        }

        // ---------- UpdateProfileAsync ----------
        [Fact]
        public async Task UpdateProfileAsync_UpdatesFields_WhenValid()
        {
            var profile = new Profile
            {
                Username = "updateuser",
                FullName = "Old",
                Email = "old@mail.com",
                Password = "123"
            };
            _context.Profiles.Add(profile);
            await _context.SaveChangesAsync();

            var dto = new UpdateProfileDto
            {
                FullName = "New Name",
                Email = "new@mail.com",
                ImageUrl = "http://img"
            };

            var updated = await _service.UpdateProfileAsync(profile.Id, dto);

            Assert.Equal("New Name", updated.FullName);
            Assert.Equal("new@mail.com", updated.Email);
            Assert.Equal("http://img", updated.ImageUrl);
        }

        [Fact]
        public async Task UpdateProfileAsync_Throws_WhenProfileNotFound()
        {
            var dto = new UpdateProfileDto { FullName = "Test", Email = "t@test.com", ImageUrl = "" };
            await Assert.ThrowsAsync<Exception>(() => _service.UpdateProfileAsync(999, dto));
        }

        // ---------- ChangePasswordAsync ----------
        [Fact]
        public async Task ChangePasswordAsync_ChangesPassword_WhenOldMatches()
        {
            var profile = new Profile { Username = "changepass", Password = "oldpass", FullName = "Pass Tester" };
            _context.Profiles.Add(profile);
            await _context.SaveChangesAsync();

            var dto = new ChangePasswordDto { OldPassword = "oldpass", NewPassword = "newpass" };
            var result = await _service.ChangePasswordAsync(profile.Id, dto);

            Assert.True(result);
            Assert.Equal("newpass", (await _context.Profiles.FindAsync(profile.Id))!.Password);
        }

        [Fact]
        public async Task ChangePasswordAsync_ReturnsFalse_WhenOldPasswordIncorrect()
        {
            var profile = new Profile { Username = "wrongold", Password = "correct", FullName = "Wrong Old" };
            _context.Profiles.Add(profile);
            await _context.SaveChangesAsync();

            var dto = new ChangePasswordDto { OldPassword = "wrong", NewPassword = "newpass" };
            var result = await _service.ChangePasswordAsync(profile.Id, dto);

            Assert.False(result);
        }

        [Fact]
        public async Task ChangePasswordAsync_Throws_WhenProfileNotFound()
        {
            var dto = new ChangePasswordDto { OldPassword = "a", NewPassword = "b" };
            await Assert.ThrowsAsync<Exception>(() => _service.ChangePasswordAsync(999, dto));
        }

        // ---------- UpdateSettingsAsync ----------
        [Fact]
        public async Task UpdateSettingsAsync_UpdatesFields_WhenValid()
        {
            var profile = new Profile
            {
                Username = "settingsuser",
                FullName = "Settings Guy",
                Password = "abc"
            };
            _context.Profiles.Add(profile);
            await _context.SaveChangesAsync();

            var dto = new UpdateSettingsDto
            {
                AccentColor = "#fff",
                DarkMode = true,
                NotificationsEnabled = true
            };

            var updated = await _service.UpdateSettingsAsync(profile.Id, dto);

            Assert.Equal("#fff", updated.AccentColor);
            Assert.True(updated.DarkMode);
            Assert.True(updated.NotificationsEnabled);
        }

        [Fact]
        public async Task UpdateSettingsAsync_Throws_WhenProfileNotFound()
        {
            var dto = new UpdateSettingsDto
            {
                AccentColor = "blue",
                DarkMode = false,
                NotificationsEnabled = false
            };

            await Assert.ThrowsAsync<Exception>(() => _service.UpdateSettingsAsync(999, dto));
        }

        // ---------- Multiple Updates Combined ----------
        [Fact]
        public async Task MultipleUpdates_DoNotInterfere()
        {
            var profile = new Profile
            {
                Username = "multiuser",
                FullName = "Original",
                Password = "123",
                Email = "a@a.com"
            };
            _context.Profiles.Add(profile);
            await _context.SaveChangesAsync();

            var profileId = profile.Id;

            await _service.ChangePasswordAsync(profileId, new ChangePasswordDto
            {
                OldPassword = "123",
                NewPassword = "456"
            });

            await _service.UpdateSettingsAsync(profileId, new UpdateSettingsDto
            {
                AccentColor = "#000",
                DarkMode = false,
                NotificationsEnabled = true
            });

            await _service.UpdateProfileAsync(profileId, new UpdateProfileDto
            {
                FullName = "Updated",
                Email = "new@mail.com",
                ImageUrl = "img.jpg"
            });

            var updated = await _context.Profiles.FindAsync(profileId);

            Assert.Equal("Updated", updated!.FullName);
            Assert.Equal("456", updated.Password);
            Assert.Equal("#000", updated.AccentColor);
            Assert.True(updated.NotificationsEnabled);
        }
    }
}
