using DecsPage.Models;
using DecsPage.Services;
using Microsoft.AspNetCore.Authorization;

namespace DecsPage.Endpoints;

public static class PlayerEndpoints
{
    public static IEndpointRouteBuilder MapPlayerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/players").WithTags("Player Management");

        group.MapGet("/", async (int? limit, int? offset, IPlayerService players) =>
        {
            var result = await players.GetAllPlayers(limit, offset);
            return Results.Ok(result);
        })
        .WithSummary("Get All Players")
        .WithDescription("Fetches a partial profile of all player")
        .Produces<List<Player>>(200);

        group.MapGet("/{id}", async (string id, IPlayerService players) =>
        {
           var result = await players.GetPlayer(id);
           if (result is null)
                return Results.NotFound();
                
            return Results.Ok(result);
        })
        .WithSummary("Get A Player")
        .WithDescription("Fetches a full profile including housing, vehicles, and gang membership using the SteamID.");

        group.MapGet("/search", async (string search, IPlayerService players) =>
        {
           var result = await players.SearchPlayersAsync(search);
           if (result is null)
                return Results.NotFound();
                
            return Results.Ok(result);
        })
        .WithSummary("Search Players")
        .WithDescription("Fetches a partial profile of all players matching search criteria. Accepts UID, SteamID, Name and Aliases");
        // .Produces<List<Player>>(200);

        group.MapPost("/{id}/updaterank", [Authorize] async (HttpContext ctx, int id, string rank, string newRank, IPlayerService players, ILoggingService logging) =>
        {
            var userName = ctx.User.Identity?.Name ?? "Unknown";
            if (!ctx.User.HasClaim("scope", "write"))
            {
                await logging.AuditLog("Access Denied: Rank Update", id, userName, $"{rank} - {newRank}");
                return Results.Forbid();
            };
            var group = ctx.User.FindFirst("side")?.Value;
            #pragma warning disable CS8600
            string column = group switch
            {
                "police" => rank switch
                {
                    "coplevel" or "tfuLevel" or "ncaLevel" or "npaslevel" or "mpuLevel" or "acadLevel" => rank,
                    _ => null
                },
                "opfor" => rank switch
                {
                    "ionlevel" or "deltalevel" or "UmLevel" or "iaflevel" or "irulevel" => rank,
                    _ => null
                },
                "medic" => rank switch 
                {
                    "mediclevel" or "hemslevel" or "hartlevel" => rank,
                    _ => null
                },
                "staff" => rank switch
                {
                    "adminlevel" or "donorlevel" or "donorexpiry" => rank,
                    _ => null
                },
                //Error
                _ => null
            }; 
            #pragma warning restore CS8600
            if (column is null) {
                await logging.AuditLog("Invalid Rank or Permissions: Rank Update", id, userName, $"{rank} - {newRank}");
                throw new Exception(column);
            };
            var result = await players.UpdateRank(id, column, newRank);
            if (result is null)
            { 
                
                await logging.AuditLog("Not Found: Rank Update", id, userName, $"{rank} - {newRank}");   
                return Results.NotFound();
            };
            await logging.AuditLog("Complete: Rank Update", id, userName, $"{rank} - {newRank}");
            return Results.Ok(result);
        })
        // .RequireAuthorization()
        .WithSummary("Update a Player Rank")
        .WithDescription("Update a Faction related players rank. Requires ID, Rank Name, New Rank Level and a correct JWT Token")
        .Produces<UpdateRank>(200);

        group.MapPost("/export", async (IJobService jobs) =>
        {
            var id = await jobs.CreateJobAsync("playersExport", new {});
            return Results.Accepted($"/jobs/{id}", new {id});
        })
        .WithSummary("Export All Player Data")
        .WithDescription("Creates a job to export all player data into a CSV for download. Returns Job ID");

        group.MapPost("/{id}/export", async (string id, IJobService jobs) =>
        {
            var jobId = await jobs.CreateJobAsync("playerExport", new { playerId =  id} );
            return Results.Accepted($"/jobs/{jobId}", new {jobId});
        })
        .WithSummary("Export A Players Data")
        .WithDescription("Creates a job to export a players data into a CSV for download. Returns Job ID");

        return app;
    }
}