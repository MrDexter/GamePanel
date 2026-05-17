using Microsoft.Data.SqlClient;
using DecsPage.Models;
using System.Text;
using System.Text.Json;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using System.Reflection.Metadata;
using DecsPage.Services;
using Stripe.Terminal;
using Stripe;

namespace DecsPage.Services;

public interface IProcessorService
{
    Task<string>UploadBlobAsync(string name, string content, CancellationToken stopToken);
    Task<string>GetDownloadUrl(string name, TimeSpan expiry);
    Task<string>ConvertToCSV<T>(int id, string type, IEnumerable<T> data, CancellationToken stopToken);
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
    private readonly IJobService _jobService;
    private readonly IShopService _shopService;

    public ProcessorService(IConfiguration config, ILogger<ProcessorService> logger, IWebHostEnvironment env, IPlayerService playerService, IGangService gangService, IJobService jobService, IShopService shopService)
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
        _jobService = jobService;
        _shopService = shopService;
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

        if (!await blob.ExistsAsync())
        {
            throw new InvalidDataException("Export file not found.");
        }

        var url = blob.GenerateSasUri(BlobSasPermissions.Read, DateTime.UtcNow.Add(expiry));

        return url.ToString();
    }

    public async Task<string>ConvertToCSV<T>(int id, string type, IEnumerable<T> data, CancellationToken stopToken)
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

        var job = await _jobService.GetJobAsync(id);
        if (job.Status == "Cancelled")
            throw new OperationCanceledException("Cancel Requested!");
        if (_env.IsDevelopment())
        {
            var folder = Path.Combine(Directory.GetCurrentDirectory(), "exports");
            Directory.CreateDirectory(folder);

            var location = Path.Combine(folder, filename);
            await System.IO.File.WriteAllTextAsync(location, sb.ToString());
            return location;
        } else {
            var blobPath = await UploadBlobAsync(filename, sb.ToString(), stopToken);
            return blobPath;  
        }; 
    }

    public async Task CompleteOrderFulfilment (OrderLong order, CancellationToken stopToken)
    {
        foreach (var item in order.Basket)
        {
            stopToken.ThrowIfCancellationRequested();
            if (item.FulfilmentMode == "Auto")
            {
                var product = await _shopService.GetItem(item.NameId);
                switch (product.NameId)
                {
                    case "thirtyDays":
                    case "sixtyDays":
                    case "oneYear":
                        int donatorLevel = product.ParamsJson.FirstOrDefault(x => x["key"].GetString() == "donatorLevel")?["value"].GetInt32() ?? 1;
                        var durationDays = int.Parse(product.ParamsJson. FirstOrDefault(x => x["key"].GetString() == "durationDays")?["value"].GetString() ?? "30");
                        await ApplyMembership(order.ReceiverId, donatorLevel, durationDays, stopToken);
                        break;
                    default:
                        Console.WriteLine("Product not Supported / Found " + product.NameId);
                        break;

                } 
            }
        }
    }

    public async Task ApplyMembership(string ReceiverId, int level, int durationDays, CancellationToken stopToken)
    { 
      using var connection = new SqlConnection(connectionString);
        {
            await connection.OpenAsync();

            var sql = @"UPDATE players SET donorlevel = @donatorLevel, 
            donorExpiry = DATEADD(
                day,
                @durationDays,
                CASE 
                    WHEN donorExpiry IS NOT NULL AND donorExpiry > GETUTCDATE()
                    THEN donorExpiry
                    ELSE GETUTCDATE()
                END
            ) WHERE playerid = @id";

            using var command = new SqlCommand(sql, connection);

            command.Parameters.AddWithValue("@donatorLevel", level);
            command.Parameters.AddWithValue("@durationDays", durationDays);
            command.Parameters.AddWithValue("@id", ReceiverId);

            var rows = await command.ExecuteNonQueryAsync();

            if (rows == 0)
                throw new InvalidOperationException("Receiver player not found.");
        }
    }

    public async Task<string>GetJobProcessorAsync(Job jobData, CancellationToken stopToken)
    {
        try
        {
            var data = JsonSerializer.Deserialize<Dictionary<string, string>>(jobData.Payload.ToString() ?? "{}");
            switch (jobData.Type)
            {
                case "playersExport":
                    var players = await _playerService.GetAllPlayers(null, null, null, null, null, null);
                    return await ConvertToCSV(jobData.Id, "playersExport", players.Data, stopToken);
                case "playerExport":
                    var player = await _playerService.GetPlayer(data!["playerId"]);
                    return await ConvertToCSV(jobData.Id, "playerExport", player, stopToken);
                case "gangsExport":
                    var gangs = await _gangService.GetAllGangs(null, null, null);
                    return await ConvertToCSV(jobData.Id, "gangsExport", gangs.Data, stopToken);
                case "gangExport":
                    var gang = await _gangService.GetGang(data!["gangId"]);
                    return await ConvertToCSV(jobData.Id, "gangExport", gang, stopToken);
                case "jobsExport":
                    var jobs = await _jobService.GetJobsAsync(null, null, null, null);
                    return await ConvertToCSV(jobData.Id, "jobsExport", jobs.Data, stopToken);
                case "jobExport":
                    var job = await _jobService.GetJobAsync(Convert.ToInt32(data!["jobId"]));
                    return await ConvertToCSV(jobData.Id, "jobExport", [job], stopToken);
                case "orderFulfilment":
                    var order = await _shopService.GetOrder(Convert.ToInt32(data!["orderId"]), true, null);
                    await CompleteOrderFulfilment(order, stopToken);
                    return "";
                default:
                    throw new InvalidDataException("Processor not found");

            }
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Failed Processor");
            throw new InvalidOperationException("An Error Occured trying get Processor");
        }
    }

}