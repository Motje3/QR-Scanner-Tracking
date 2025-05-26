using BackendAPI.Models;

namespace BackendAPI.Services
{
    public interface ITokenService
    {
        string CreateToken(Profile user);
    }
}
