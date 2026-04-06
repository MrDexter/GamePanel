using DecsPage.Services;
using DecsPage.Models;
namespace DecsPage.Endpoints;

public static class StatsEndpoints
{
    public static IEndpointRouteBuilder MapStatsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/stats").WithTags("Statistics");

        group.MapGet("/Player", async (IStatsService stats) =>
        {
            try
            {
                var results = await stats.GetPlayerStats();
                return Results.Ok( new { player = results });
            } catch (InvalidOperationException error)
            {
                return Results.NotFound( new { message = error.Message });
            }
        })
        .WithSummary("Get Player Stats")
        .WithDescription("Get all player related stats")
        .Produces<DashboardPlayerStats>(200);

        return app;
    }
};