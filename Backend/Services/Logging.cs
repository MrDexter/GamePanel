using Microsoft.Data.SqlClient;
using DecsPage.Models;

namespace DecsPage.Services;

public interface ILoggingService
{
    Task AuditLog(string type, string id, string performedBy, string details);   
}

public class LoggingService : ILoggingService
{
    private readonly string connectionString;
    private readonly ILogger<LoggingService> _logger;
    public LoggingService(IConfiguration config, ILogger<LoggingService> logger)
    {
        connectionString = config.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Missing Default Connection");
        _logger = logger;
    }

    public async Task AuditLog(string type, string id, string performedBy, string details)
    {
        using var connection = new SqlConnection(connectionString);
        try 
        {
            await connection.OpenAsync();
            var sql = @"Insert INTO audit_log (event_type, player_id, performed_by, details) VALUES (@type, @id, @performedBy, @details)";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@type", type);
            command.Parameters.AddWithValue("@id", id);
            command.Parameters.AddWithValue("@performedBy", performedBy);
            command.Parameters.AddWithValue("@details", details);

            await command.ExecuteNonQueryAsync();
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Audit Insert Failed! {type} Request by {user} for Player: {playerid} Rank: {details}", type, performedBy, id, details);
        } 
    }
}