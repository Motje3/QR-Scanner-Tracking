public class PasswordResetRequestDto
{
    public string Email { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
}