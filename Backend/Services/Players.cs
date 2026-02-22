using Microsoft.Data.SqlClient;
using BackgroundJobs.Models;

namespace BackgroundJobs.Services;

public interface IPlayerService
{
   
};

public class PlayerService : IPlayerService
{
    public readonly string connectionString;

    public PlayerService(IConfiguration config)
    {
        connectionString = config.GetConnectionString("DefaultConnection")
        ?? throw new Exception("No Default Connection");
    }
};