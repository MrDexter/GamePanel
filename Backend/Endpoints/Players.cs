using BackgroundJobs.Models;
using BackgroundJobs.Services;
// using Microsoft.ASPNetCore.Authorization;

namespace BackgroundJobs.Endpoints;

public static class PlayerEndpoints
{
    public static IEndpointRouteBuilder MapPlayerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/players");

        group.MapPost("/dump", async (IJobService jobs) =>
        {
            var id = await jobs.CreateJobAsync("PlayersDump");
            return Results.Accepted($"/jobs/{id}", new {id});
        });
        return app;
    }
}