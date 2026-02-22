using DecsPage.Models;
using DecsPage.Services;

namespace DecsPage.Endpoints;

public static class GangEndpoints
{
    public static IEndpointRouteBuilder MapGangEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/gangs").WithTags("Gang Management");

        group.MapGet("/", async (int? limit, int? offset, IGangService gangs) =>
        {
            var result = await gangs.GetAllGangs(limit, offset);
            return Results.Ok(result);
        });

        group.MapGet("/{id}", async (string id, IGangService gangs) =>
        {
            var result = await gangs.GetGang(id);
            if (result is null)
                return Results.NotFound();
            return Results.Ok(result);
        });

        group.MapPost("/export", async (IJobService jobs) =>
        {
            var id = await jobs.CreateJobAsync("gangsExport", new {});
            return Results.Accepted($"/jobs/{id}", new {id});
        });

        group.MapPost("/{id}/export", async (string id, IJobService jobs) =>
        {
            var jobId = await jobs.CreateJobAsync("gangExport", new { gangId =  id} );
            return Results.Accepted($"/jobs/{jobId}", new {jobId});
        });

        return app;
    }
}