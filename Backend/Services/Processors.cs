using Microsoft.Data.SqlClient;
using BackgroundJobs.Models;
using System.Text;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using System.Reflection.Metadata;

namespace BackgroundJobs.Services;

public interface IProcessorService
{
    Task<string>UploadBlobAsync(string name, string content, CancellationToken stopToken);
    Task<string>GetDownloadUrl(string name, TimeSpan expiry);
    Task<string>ConvertToCSV<T>(string id, string type, IEnumerable<T> data, CancellationToken stopToken);
    Task<string>GetJobProcessorAsync(Job job, CancellationToken stopToken);
    Task <string>DumpPlayersAsync (string id, CancellationToken stopToken);
}

public class ProcessorService : IProcessorService
{
    public readonly string connectionString;
    public readonly ILogger<ProcessorService> _logger;
    private readonly BlobContainerClient _blobContainer;

    public ProcessorService(IConfiguration config, ILogger<ProcessorService> logger)
    {
        connectionString = config.GetConnectionString("DefaultConnection")
        ?? throw new Exception("No Default Connection");
        _logger = logger;

        var blobConnectionString = config["Storage:ConnectionString"]
        ?? throw new Exception("No Blob Connection");
        var blobContainer = config["Storage:Container"]
        ?? throw new Exception("No Blob Container");

        _blobContainer = new BlobContainerClient(blobConnectionString, blobContainer);
        _blobContainer.CreateIfNotExists();
    }

    public async Task<string>UploadBlobAsync(string name, string content, CancellationToken stopToken)
    {
        var blob = _blobContainer.GetBlobClient(name);
        await blob.UploadAsync(BinaryData.FromString(content), overwrite: true, cancellationToken: stopToken);
    
        return name;
    }

    public async Task<string>GetDownloadUrl(string name, TimeSpan expiry)
    {
        var blob = _blobContainer.GetBlobClient(name);

        var url = blob.GenerateSasUri(BlobSasPermissions.Read, DateTime.UtcNow.Add(expiry));

        return url.ToString();
    }

    public async Task<string>ConvertToCSV<T>(string id, string type, IEnumerable<T> data, CancellationToken stopToken)
    {
         var sb = new StringBuilder();

        var properties = typeof(T).GetProperties();

        sb.AppendLine(string.Join(",", properties.Select(p => p.Name))); // Columns
 
        foreach( var item in data)
        {
            stopToken.ThrowIfCancellationRequested();

            var values = properties.Select(p =>
            {
                var value = p.GetValue(item);
                if (value == null) return "";
                return value.ToString();
            });
            sb.AppendLine(string.Join(",", values));
        };
 
        var filename = $"{type}_{id}_{DateTime.UtcNow:ddMMyyyyHHmmss}.csv";
        // var folder = Path.Combine(Directory.GetCurrentDirectory(), "exports");
        // Directory.CreateDirectory(folder);

        // var location = Path.Combine(folder, filename);
        // await File.WriteAllTextAsync(location, sb.ToString());
        var blobPath = await UploadBlobAsync(filename, sb.ToString(), stopToken);

        return blobPath;   
    }

    public async Task<string>GetJobProcessorAsync(Job job, CancellationToken stopToken)
    {
        try
        {
            switch (job.Type)
            {
                case "PlayersDump":
                    return await DumpPlayersAsync(job.Id, stopToken);

                default:
                    return null;

            }
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Failed Processor");
            return null;
        }
    }

    public async Task<string>DumpPlayersAsync (string id, CancellationToken stopToken)
    {
        var result = new List<Player>();
        using (var connection = new SqlConnection(connectionString))
        {
          await connection.OpenAsync();
          var sql = "Select uid, name, playerid, cash, bankacc, cartelCredits, adminLevel, copLevel, ionLevel, medicLevel, last_seen, insert_time FROM players";
          using var command = new SqlCommand(sql, connection);
          using var reader = await command.ExecuteReaderAsync();
          while (await reader.ReadAsync())
            {
              var row = new Player (
                reader["uid"].ToString() ?? string.Empty,
                reader["name"].ToString() ?? string.Empty,
                reader["playerid"].ToString() ?? string.Empty,
                reader["cash"].ToString() ?? string.Empty,
                reader["bankacc"].ToString() ?? string.Empty,
                reader["cartelCredits"].ToString() ?? string.Empty,
                reader["adminLevel"].ToString() ?? string.Empty,
                reader["copLevel"].ToString() ?? string.Empty,
                reader["ionLevel"].ToString() ?? string.Empty,
                reader["medicLevel"].ToString() ?? string.Empty,
                reader.GetDateTime(reader.GetOrdinal("last_seen")),
                reader.GetDateTime(reader.GetOrdinal("insert_time"))
              );  
              result.Add(row);
            };  
        };
        var file = await ConvertToCSV(id, "playersDump", result, stopToken);
        return file;
    }

}