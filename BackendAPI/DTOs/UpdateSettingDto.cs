namespace BackendAPI.DTOs
{
    public class UpdateSettingsDto
    {
        public string AccentColor { get; set; } = "#A970FF";
        public bool DarkMode { get; set; } = true;
        public bool NotificationsEnabled { get; set; } = true;
    }
}
