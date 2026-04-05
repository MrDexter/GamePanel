using DecsPage.Services;
using DecsPage.Models;
using Microsoft.Data.SqlClient;
namespace DecsPage.Endpoints;

public static class MiscEndpoints
{
    public static IEndpointRouteBuilder MapMiscEndpoints(this IEndpointRouteBuilder app)
    {

        app.MapGet("/logging/GetLogs", async (string id, string? search, string? type, int? offset, int? limit, ILoggingService logging) =>
        {
            try 
            {
                var logs = await logging.GetLogs(id, search, type, offset, limit);
                return Results.Ok(logs);
            } catch (InvalidDataException error)
            {
                return Results.NotFound(new {message = error.Message});
            };

        })
        .WithTags("Logging")
        .RequireAuthorization("Staff")
        .WithSummary("Get A Players Logs")
        .WithDescription("Get a Players Logs, Requires SteamID, Staff JWT Token and Optionaly Incoming or Outgoing Logs. Default All")
        .Produces<PlayerLogs>(200);

/*         app.MapGet("/health", async () =>
        {
            return Results.Ok("Ok");   
        }).WithTags("Security and Misc");

        app.MapGet("/debug/config", (IConfiguration cfg) =>
        {
            var hasSql = !string.IsNullOrWhiteSpace(cfg.GetConnectionString("DefaultConnection"));
            var hasBlob = !string.IsNullOrWhiteSpace(cfg["Storage:ConnectionString"]);
            var container = cfg["Storage:Container"] ?? "(null)";

            return Results.Ok(new { hasSql, hasBlob, container });
        }).WithTags("Security and Misc");

        app.MapGet("/debug/sql", async (IConfiguration cfg) =>
{
            await using var conn = new SqlConnection(cfg.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            await using var cmd = new SqlCommand("SELECT 1", conn);
            var x = (int)await cmd.ExecuteScalarAsync();

            return Results.Ok(new { ok = x == 1 });
        }).WithTags("Security and Misc"); */


        return app;
    }
};