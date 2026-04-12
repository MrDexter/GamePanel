using Microsoft.Data.SqlClient;
using System.Text.Json;
using System.Text.Json.Nodes;
using DecsPage.Models;
using DecsPage.Background;

namespace DecsPage.Services;

public interface IJobService
{
  Task<PaginatedRecord<Job>>GetJobsAsync(string? search, string? statuses, int? limit, int? offset);
  Task<Job>GetJobAsync(int id);  
  Task<object>CreateJobAsync(string type, object? payload);
  Task StartWorker();
  Task <Job>GetWaitingJobAsync(CancellationToken stopToken);
  Task<String>UpdateJobStatusAsync(int id, string status, string? result);
  Task<bool>TogglePriority(int id, bool toggle);

};

public class JobService : IJobService
{
    public readonly string connectionString;
    public readonly ILogger<JobService> _logger;
    public readonly IJobWorker _jobWorker;

    public JobService(IConfiguration config, ILogger<JobService> logger, IJobWorker jobWorker)
    {
        connectionString = config.GetConnectionString("DefaultConnection")
        ?? throw new Exception("No Default Connection");
        _logger = logger;
        _jobWorker = jobWorker;
    }

    public async Task<PaginatedRecord<Job>>GetJobsAsync(string? search, string? statuses, int? limit, int? offset)
    {
        var totalRows = 0;
        var result = new List<Job>();
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"Select id, type, status, payload, result, created_at, updated_at, priority, COUNT(*) OVER() AS TotalRows FROM jobs WHERE 1=1 ";
            if (!string.IsNullOrWhiteSpace(search))
            {
                sql += @"
                    AND (
                        id LIKE '%' + @search + '%'
                        OR type LIKE '%' + @search + '%'
                        OR status LIKE '%' + @search + '%'
                        OR payload LIKE '%' + @search + '%'
                    )
                ";
            };
            if (!string.IsNullOrWhiteSpace(statuses))
            {
                sql += "AND (status IN (SELECT TRIM(value) FROM STRING_SPLIT(@statuses, ','))) ";
            };
           sql += " ORDER BY created_at DESC ";
            if (limit.HasValue || offset.HasValue)
            {
                sql += " OFFSET @offset ROWS";
                if (limit.HasValue)
                {
                    sql += " FETCH NEXT @limit ROWS ONLY";
                }
            };
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@statuses", statuses ?? "");
            command.Parameters.AddWithValue("@offset", offset ?? 0);
            command.Parameters.AddWithValue("@limit", limit ?? 0);
            command.Parameters.AddWithValue("@search", search ?? "");
            var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                if (totalRows == 0)
                {
                    totalRows = reader.GetInt32(reader.GetOrdinal("TotalRows"));
                }
                var row = new Job (
                    Convert.ToInt32(reader["id"].ToString()),
                    reader["type"].ToString() ?? string.Empty,
                    reader["status"].ToString() ?? string.Empty,
                    reader["result"].ToString() ?? string.Empty,
                    reader["payload"].ToString() ?? "{}",
                    Convert.ToBoolean(reader["priority"] ?? false),
                    reader.GetDateTime(reader.GetOrdinal("created_at")),
                    reader.GetDateTime(reader.GetOrdinal("updated_at"))
                );
                result.Add(row);
            };
        }
        var response = new PaginatedRecord<Job>(
            totalRows,
            result
        );
        return response;
    }

    public async Task<Job>GetJobAsync(int id)
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"Select id, type, status, payload, result, created_at, updated_at, priority FROM jobs where id = @id";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", id);  
            var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                throw new InvalidDataException("Job not found!");
            }
            return new Job (
                Convert.ToInt32(reader["id"].ToString()),
                reader["type"].ToString() ?? string.Empty,
                reader["status"].ToString() ?? string.Empty,
                reader["result"].ToString() ?? string.Empty,
                reader["payload"].ToString() ?? "{}",
                Convert.ToBoolean(reader["priority"] ?? false),
                reader.GetDateTime(reader.GetOrdinal("created_at")),
                reader.GetDateTime(reader.GetOrdinal("updated_at"))
            );
        };
    }

    public async Task<object>CreateJobAsync(string type, object? payload)
    {
        var JsonPayload = JsonSerializer.Serialize(payload);
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = "INSERT INTO jobs (type, status, payload, result) OUTPUT INSERTED.id VALUES (@type, 'Pending', @payload, NULL);";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@type", type);
            command.Parameters.AddWithValue("@payload", JsonPayload);
            var id = Convert.ToInt32(await command.ExecuteScalarAsync());
            // Manual Trigger Worker loop on job create
            _ = StartWorker();
            return id;
        };
    }

    public async Task StartWorker()
    {
        using var stopToken = new CancellationTokenSource(TimeSpan.FromSeconds(25)); // Expires after 25 seconds
        await _jobWorker.ExecuteAsync(stopToken.Token);
    }

    public async Task<Job>GetWaitingJobAsync(CancellationToken stopToken)
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = "WITH cte AS (SELECT TOP (1) * FROM jobs WHERE status = 'Pending' ORDER BY created_at ASC) UPDATE cte SET status = 'Processing', updated_at = GETDATE() OUTPUT INSERTED.*;";
            using var command = new SqlCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {return null!;};
            return new Job (
                Convert.ToInt32(reader["id"].ToString()),
                reader["type"].ToString() ?? string.Empty,
                reader["status"].ToString() ?? string.Empty,
                reader["result"].ToString() ?? string.Empty,
                reader["payload"].ToString() ?? "{}",
                Convert.ToBoolean(reader["priority"] ?? false),
                reader.GetDateTime(reader.GetOrdinal("created_at")),
                reader.GetDateTime(reader.GetOrdinal("updated_at"))
            );
        };
    }

    public async Task<string>UpdateJobStatusAsync(int id, string status, string? result)
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = $"UPDATE jobs SET status = @status, result = @result, updated_at = GETDATE() WHERE id = @id";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@status", status);
            command.Parameters.AddWithValue("@id", id);
            command.Parameters.AddWithValue("@result", result ?? "");
            int reader = await command.ExecuteNonQueryAsync();
            if (reader == 0)
            {
                throw new InvalidDataException("Failed to Update Job!");
            }
            // Manual Trigger Worker loop on job create
            if (status == "Pending")
                _ = StartWorker();
            return "Success";
        }
    }

    public async Task<bool>TogglePriority(int id, bool toggle)
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = $"UPDATE jobs SET priority = @toggle WHERE id = @id";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@toggle", toggle);
            command.Parameters.AddWithValue("@id", id);
            int reader = await command.ExecuteNonQueryAsync();
            if (reader == 0)
                throw new InvalidDataException("Failed to Set to Priority");
            return true;
        }
    }


};