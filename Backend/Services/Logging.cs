using Microsoft.Data.SqlClient;
using DecsPage.Models;

namespace DecsPage.Services;

public interface ILoggingService
{
    Task AuditLog(string type, string id, string performedBy, string details);   
    Task<List<PlayerLogs>> GetLogs(string id, string? tpye, int? offset, int? limit);
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
            await connection.OpenAsync(); // Use a Join to get a Players current name by steamid
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

    public async Task<List<PlayerLogs>> GetLogs(string id, string? type, int? offset, int? limit)
    {
        var results = new List<PlayerLogs>();
        using (var connection = new SqlConnection(connectionString))
        {
           await connection.OpenAsync();
           var sql = "SELECT event_type, player_id, performed_by, details, created_at FROM audit_log ";
            sql += type switch
            {
                "incoming" => "WHERE player_id = @steamid ",
                "outgoing" => "WHERE performed_by = @steamid ",
                _          => "WHERE player_id = @steamid OR performed_by = @steamid "
            };
           sql += "ORDER BY created_at DESC ";
            if (limit.HasValue || offset.HasValue)
            {
                sql += " OFFSET @offset ROWS";
                if (limit.HasValue)
                {
                    sql += " FETCH NEXT @limit ROWS ONLY";
                }
            };
           using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@steamid", id);
            command.Parameters.AddWithValue("@offset", offset ?? 0);
            command.Parameters.AddWithValue("@limit", limit ?? 0);
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var row =  new PlayerLogs(
                    reader["event_type"].ToString() ?? string.Empty,
                    reader["player_id"].ToString() ?? string.Empty,
                    reader["performed_by"].ToString() ?? string.Empty,
                    reader["details"].ToString() ?? string.Empty,
                    reader.GetDateTime(reader.GetOrdinal("created_at"))
                );
                results.Add(row);
            }
            return results;
        }
    }
}