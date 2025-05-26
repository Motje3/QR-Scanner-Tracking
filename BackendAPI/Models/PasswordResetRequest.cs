public class PasswordResetRequest
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string RequestedNewPassword { get; set; } = null!;
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public bool Processed { get; set; } = false;
}