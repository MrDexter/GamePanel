using Microsoft.Data.SqlClient;
using BackgroundJobs.Models;
using BackgroundJobs.Background;

namespace BackgroundJobs.Services;

public interface IJobService
{
  Task<List<Job>>GetJobsAsync();
  Task<Job>GetJobAsync(string id);  
  Task<object>CreateJobAsync(string type);
  Task StartWorker();
  Task <Job>GetWaitingJobAsync(CancellationToken stopToken);
  Task<String>UpdateJobStatusAsync(string id, string status, string result);

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

    public async Task<List<Job>>GetJobsAsync() // Add Param for Failed?
    {
        var result = new List<Job>();
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"Select * FROM jobs WHERE status !='complete'";
            using var command = new SqlCommand(sql, connection);
            var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var row = new Job (
                    reader["id"].ToString() ?? string.Empty,
                    reader["type"].ToString() ?? string.Empty,
                    reader["status"].ToString() ?? string.Empty,
                    reader["result"].ToString() ?? string.Empty,
                    reader.GetDateTime(reader.GetOrdinal("created_at")),
                    reader.GetDateTime(reader.GetOrdinal("updated_at"))
                );
                result.Add(row);
            };
        }
        return result;
    }

    public async Task<Job>GetJobAsync(string id)
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"Select * FROM jobs where id = @id";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", id);  
            var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return null;
            }
            return new Job (
                reader["id"].ToString() ?? string.Empty,
                reader["type"].ToString() ?? string.Empty,
                reader["status"].ToString() ?? string.Empty,
                reader["result"].ToString() ?? string.Empty,
                reader.GetDateTime(reader.GetOrdinal("created_at")),
                reader.GetDateTime(reader.GetOrdinal("updated_at"))
            );
        };
    }

    public async Task<object>CreateJobAsync(string type)
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = "INSERT INTO jobs (type, status, payload, result) OUTPUT INSERTED.id VALUES (@type, 'Incomplete', @payload, NULL);";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@type", type);
            command.Parameters.AddWithValue("@payload", DBNull.Value);
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
            var sql = "WITH cte AS (SELECT TOP (1) * FROM jobs WHERE status = 'incomplete' ORDER BY created_at ASC) UPDATE cte SET status = 'processing', updated_at = GETDATE() OUTPUT INSERTED.*;";
            using var command = new SqlCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {return null;};
            return new Job (
                reader["id"].ToString() ?? string.Empty,
                reader["type"].ToString() ?? string.Empty,
                reader["status"].ToString() ?? string.Empty,
                reader["result"].ToString() ?? string.Empty,
                reader.GetDateTime(reader.GetOrdinal("created_at")),
                reader.GetDateTime(reader.GetOrdinal("updated_at"))
            );
        };
    }

    public async Task<string>UpdateJobStatusAsync(string id, string status, string result)
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = $"UPDATE jobs SET status = @status, result = @result, updated_at = GETDATE() WHERE id = @id";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@status", status);
            command.Parameters.AddWithValue("@id", id);
            command.Parameters.AddWithValue("@result", result);
            int reader = await command.ExecuteNonQueryAsync();
            if (reader == 0)
            {
                return "Failed";
            }
            return "Seuccess";
        }
    }
};