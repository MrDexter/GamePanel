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

        group.MapPost("/{id}/updateWhitelisting", [Authorize] async (HttpContext ctx, WhitelistUpdateRequest request, IPlayerService players, ILoggingService logging) =>
        {
            try
            {
                await players.UpdateWhitelisting(ctx, request);
                return Results.Ok(); 
            } catch (Exception ex)
            {
                return Results.BadRequest(new { message = ex.Message});
            }
        })
        // .RequireAuthorization()
        .WithSummary("Update a Player Rank")
        .WithDescription("Update a Faction related players ranks. Requires table of ranks to update and a correct JWT Token")
        .Produces(200);

        group.MapPost("/{id}/updaterank", [Authorize] async (HttpContext ctx, int id, string rank, string newRank, IPlayerService players, ILoggingService logging) =>
        {
            // Add Guid check to ensure from Dashboard
            var userName = ctx.User.Identity?.Name ?? "Unknown";
            var userRank = ctx.User.FindFirst(rank)?.Value;
            if (userRank == null || Int32.Parse(userRank) < Int32.Parse(newRank))
            {
                return Results.Forbid();
            };   
            try
            {         
                await players.UpdateRank(id, rank, newRank);
                await logging.AuditLog("Rank Update Success", id, userName, $"{rank} - {newRank}");
                return Results.Ok(new { message = "Ranks Updated"});
            } catch (InvalidDataException ex)
            { 
                await logging.AuditLog($"Blocked: {ex.Message}", id, userName, $"{rank} - {newRank}"); 
                return Results.BadRequest(new { error = ex.Message });
            }
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