using DecsPage.Models;
using DecsPage.Services;
using Microsoft.AspNetCore.Authorization;

namespace DecsPage.Endpoints;

public static class PlayerEndpoints
{
    public static IEndpointRouteBuilder MapPlayerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/players").WithTags("Player Management");

        group.MapGet("/", async (int? limit, int? offset, string? search, string? factions, string? orderby, string? direction, IPlayerService players) =>
        {
            var result = await players.GetAllPlayers(limit, offset, search, factions, orderby, direction);
            if (result is null)
                return Results.NotFound();

            return Results.Ok(result);
        })
        .WithSummary("Get All Players")
        .WithDescription("Fetches a partial profile of all players. Optional Params, Limit, Offset, Search (Name, Aliases, ID, SteamID)")
        .Produces<PaginatedRecord<Player>>(200);

        group.MapGet("/{id}", async (string id, IPlayerService players) =>
        {
            try {
                var result = await players.GetPlayer(id);
                return Results.Ok(result);
            } catch (InvalidDataException error)
            {
                return Results.NotFound(new { message = error.Message});
                
            };
        })
        .WithSummary("Get A Player")
        .WithDescription("Fetches a full profile including housing, vehicles, and gang membership using the SteamID.");

        group.MapPost("/{id}/updateWhitelisting", async (HttpContext context, string id, WhitelistUpdateRequest request, IPlayerService players, ILoggingService logging) =>
        {
            if (!context.Request.Cookies.TryGetValue("refreshToken", out var oldGuid))
            {
                return Results.Unauthorized(); // no token exists, user needs to log back in
            };
            try
            {
                await players.UpdateWhitelisting(context, request);
                return Results.Ok(new { message = "Update Successful!" }); 
            } catch (Exception ex)
            {
                return Results.BadRequest(new { message = "Update Failed: " + ex.Message});
            }
        })
        .RequireAuthorization()
        .WithSummary("Update a Players Whitelisting")
        .WithDescription("Update a Faction related players ranks. Requires table of ranks to update and a correct JWT Token")
        .Produces(200);

        group.MapPost("/{id}/updaterank", async (HttpContext context, string id, string rank, string newRank, IPlayerService players, ILoggingService logging) =>
        {
            var userName = context.User.Identity?.Name ?? "Unknown";
            var userRank = context.User.FindFirst(rank)?.Value;
            if (userRank == null || Int32.Parse(userRank) < Int32.Parse(newRank))
            {
                return Results.Forbid();
            };   
            try
            {         
                await players.UpdateRank(id, rank, newRank);
                await logging.AuditLog("Rank Update", id, userName, $"{rank} - {newRank}");
                return Results.Ok(new { message = "Ranks Updated"});
            } catch (InvalidDataException ex)
            { 
                await logging.AuditLog($"Blocked: {ex.Message}", id, userName, $"{rank} - {newRank}"); 
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .RequireAuthorization()
        .WithSummary("Update a Player Rank")
        .WithDescription("Update a Faction related players rank. Requires ID, Rank Name, New Rank Level and a correct JWT Token")
        .Produces<UpdateRank>(200);

        group.MapPost("/export", async (IJobService jobs) =>
        {
            var jobId = await jobs.CreateJobAsync("playersExport", new {});
            return Results.Accepted($"/jobs/{jobId}", new {jobId});
        })
        .RequireAuthorization("Staff")
        .WithSummary("Export All Player Data")
        .WithDescription("Creates a job to export all player data into a CSV for download. Returns Job ID");

        group.MapPost("/{id}/export", async (string id, IJobService jobs) =>
        {
            var jobId = await jobs.CreateJobAsync("playerExport", new { playerId =  id} );
            return Results.Accepted($"/jobs/{jobId}", new {jobId});
        })
        .RequireAuthorization("Staff")
        .WithSummary("Export A Players Data")
        .WithDescription("Creates a job to export a players data into a CSV for download. Returns Job ID");

        return app;
    }
}