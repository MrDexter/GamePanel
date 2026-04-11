using DecsPage.Services;
using DecsPage.Models;
namespace DecsPage.Endpoints;

public static class StatsEndpoints
{
    public static IEndpointRouteBuilder MapStatsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/stats").WithTags("Statistics");

        group.MapGet("/dashboard", async (IStatsService stats, IJobService jobs) =>
        {
            try
            {
                var playerResults = await stats.GetPlayerStats();
                var groupResults = await stats.GetGroupStats();
                var userResults = await stats.GetUserStats();
                var jobResults = await stats.GetJobStats();
                var jobsList = await jobs.GetJobsAsync(null, null, 3, 0);
                var vehicleResults = await stats.GetVehicleStats();
                var housingResults = await stats.GetHousingStats();
                var topResults = await stats.GetTopStats();

                return Results.Ok(new DashboardStats
                {
                    Player = playerResults,
                    Group = groupResults,
                    User = userResults,
                    Job = jobResults,
                    Jobs = jobsList,
                    Vehicle = vehicleResults,
                    Housing = housingResults,
                    Top = topResults
                });
            } catch (InvalidOperationException error)
            {
                return Results.NotFound( new { message = error.Message });
            }
        })
        .WithSummary("Get Dashboard Stats")
        .WithDescription("Get all stats displayed on the dashbaord stats")
        .Produces<DashboardStats>(200);

        return app;
    }
};