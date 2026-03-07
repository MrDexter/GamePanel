using Microsoft.Data.SqlClient;
using DecsPage.Models;
using System.Text;
using System.Text.Json;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using System.Reflection.Metadata;
using DecsPage.Services;

namespace DecsPage.Services;

public interface IProcessorService
{
    Task<string>UploadBlobAsync(string name, string content, CancellationToken stopToken);
    Task<string>GetDownloadUrl(string name, TimeSpan expiry);
    Task<string>ConvertToCSV<T>(string id, string type, IEnumerable<T> data, CancellationToken stopToken);
    Task<string>GetJobProcessorAsync(Job job, CancellationToken stopToken);
}

public class ProcessorService : IProcessorService
{
    public readonly string connectionString;
    public readonly ILogger<ProcessorService> _logger;
    private readonly BlobContainerClient _blobContainer;
    private readonly IWebHostEnvironment _env;
    private readonly IPlayerService _playerService;
    private readonly IGangService _gangService;

    public ProcessorService(IConfiguration config, ILogger<ProcessorService> logger, IWebHostEnvironment env, IPlayerService playerService, IGangService gangService)
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

        _env = env;
        _playerService = playerService;
        _gangService = gangService;
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

        if (data.FirstOrDefault() is IDictionary<string, object> firstRow)
        {
            var keys = firstRow.Keys.ToList();
            sb.AppendLine(string.Join(",", keys));

            foreach (var row in data.Cast<IDictionary<string, object>>())
            {
                var values = keys.Select(k => row[k]?.ToString()?.Replace(",", " "));
                sb.AppendLine(string.Join(",", values));
            }
        } else {
            var properties = typeof(T).GetProperties();

            sb.AppendLine(string.Join(",", properties.Select(p => p.Name)));
    
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
        };
 
        var filename = $"{type}_{id}_{DateTime.UtcNow:ddMMyyyyHHmmss}.csv";

        if (_env.IsDevelopment())
        {
            var folder = Path.Combine(Directory.GetCurrentDirectory(), "exports");
            Directory.CreateDirectory(folder);

            var location = Path.Combine(folder, filename);
            await File.WriteAllTextAsync(location, sb.ToString());
            return location;
        } else {
            var blobPath = await UploadBlobAsync(filename, sb.ToString(), stopToken);
            return blobPath;  
        }; 
    }

    public async Task<string>GetJobProcessorAsync(Job job, CancellationToken stopToken)
    {
        try
        {
            var data = JsonSerializer.Deserialize<Dictionary<string, string>>(job.Payload.ToString() ?? "{}");
            switch (job.Type)
            {
                case "playersExport":
                    var players = await _playerService.GetAllPlayers(null, null);
                    return await ConvertToCSV(job.Id, "playersExport", players, stopToken);
                case "playerExport":
                    var player = await _playerService.GetPlayer(data["playerId"]);
                    return await ConvertToCSV(job.Id, "playerExport", player, stopToken);
                case "gangsExport":
                    var gangs = await _gangService.GetAllGangs(null, null);
                    return await ConvertToCSV(job.Id, "gangsExport", gangs, stopToken);
                case "gangExport":
                    var gang = await _gangService.GetGang(data["gangId"]);
                    return await ConvertToCSV(job.Id, "gangExport", gang, stopToken);
                default:
                    return null!;

            }
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Failed Processor");
            return null!;
        }
    }

}