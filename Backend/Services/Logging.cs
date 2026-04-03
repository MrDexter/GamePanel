using Microsoft.Data.SqlClient;
using DecsPage.Models;

namespace DecsPage.Services;

public interface ILoggingService
{
    Task AuditLog(string type, string id, string performedBy, string details);   
    Task<PaginatedRecord<PlayerLogs>> GetLogs(string id, string? search, string? tpye, int? offset, int? limit);
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
            command.Parameters.AddWithValue("@id", id ?? "");
            command.Parameters.AddWithValue("@performedBy", performedBy);
            command.Parameters.AddWithValue("@details", details);

            await command.ExecuteNonQueryAsync();
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Audit Insert Failed! {type} Request by {user} for Player: {playerid} Rank: {details}", type, performedBy, id, details);
        } 
    }

    public async Task<PaginatedRecord<PlayerLogs>> GetLogs(string id, string? search, string? type, int? offset, int? limit)
    {
        var totalRows = 0;
        var results = new List<PlayerLogs>();
        using (var connection = new SqlConnection(connectionString))
        {
           await connection.OpenAsync();
           var sql = "SELECT a.event_type, a.player_id, a.performed_by, a.details, a.created_at, target.name AS target_name, performer.name AS performer_name, COUNT(*) OVER() AS TotalRows FROM audit_log a LEFT JOIN players target ON target.playerid = a.player_id LEFT JOIN players performer ON performer.playerid = a.performed_by ";
            sql += type switch
            {
                "incoming" => "WHERE (player_id = @steamid) ",
                "outgoing" => "WHERE (performed_by = @steamid) ",
                _          => "WHERE (player_id = @steamid OR performed_by = @steamid) "
            };
            if (!string.IsNullOrWhiteSpace(search))
            {
                sql += @"
                    AND (
                        a.event_type LIKE '%' + @search + '%'
                        OR a.player_id LIKE '%' + @search + '%'
                        OR a.performed_by LIKE '%' + @search + '%'
                        OR a.details LIKE '%' + @search + '%'
                        OR target.name LIKE '%' + @search + '%'
                        OR performer.name LIKE '%' + @search + '%'
                    )
                ";
            }
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
            command.Parameters.AddWithValue("@search", search ?? "");
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                if (totalRows == 0)
                {
                    totalRows = reader.GetInt32(reader.GetOrdinal("TotalRows"));
                }
                var row = new PlayerLogs
                {
                    EventType = reader["event_type"].ToString() ?? string.Empty,
                    PlayerId = reader["player_id"].ToString() ?? string.Empty,
                    PerformedBy = reader["performed_by"].ToString() ?? string.Empty,
                    TargetName = reader["target_name"].ToString() ?? string.Empty,
                    PerformedByName = reader["performer_name"].ToString() ?? string.Empty,
                    Details = reader["details"].ToString() ?? string.Empty,
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at"))
                };
                results.Add(row);
            }
        };
        var response = new PaginatedRecord<PlayerLogs>(
            totalRows,
            results
        );
        return response;
    }
}