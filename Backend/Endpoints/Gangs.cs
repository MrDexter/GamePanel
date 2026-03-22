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
        })
        .WithSummary("Get All Gangs")
        .WithDescription("Fetches all currently active gangs")
        .Produces<List<Gangs>>(200);

        group.MapGet("/{id}", async (string id, IGangService gangs) =>
        {
            try
            {
                var result = await gangs.GetGang(id);
                return Results.Ok(result);
            } catch (InvalidDataException error)
            {
                return Results.NotFound(new { message = error.Message});
            };
        })
        .WithSummary("Get a Gang")
        .WithDescription("Fetches a full profile including housing using the Gang ID, Name or Tag.");

        group.MapPost("/export", async (IJobService jobs) =>
        {
            var id = await jobs.CreateJobAsync("gangsExport", new {});
            return Results.Accepted($"/jobs/{id}", new {id});
        })
        .RequireAuthorization("Staff")
        .WithSummary("Export All Gangs Data")
        .WithDescription("Creates a job to export all gangs data into a CSV for download. Returns Job ID");

        group.MapPost("/{id}/export", async (string id, IJobService jobs) =>
        {
            var jobId = await jobs.CreateJobAsync("gangExport", new { gangId =  id} );
            return Results.Accepted($"/jobs/{jobId}", new {jobId});
        })
        .RequireAuthorization("Staff")
        .WithSummary("Export A Gangs Data")
        .WithDescription("Creates a job to export a gangss data into a CSV for download. Returns Job ID");

        return app;
    }
}