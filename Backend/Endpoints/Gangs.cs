using DecsPage.Models;
using DecsPage.Services;

namespace DecsPage.Endpoints;

public static class GangEndpoints
{
    public static IEndpointRouteBuilder MapGangEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/groups").WithTags("Group Management");

        group.MapGet("/", async (int? limit, int? offset, string? search, IGangService gangs) =>
        {
            var result = await gangs.GetAllGangs(limit, offset, search);
            if (result is null)
                return Results.NotFound();

            return Results.Ok(result);
        })
        .WithSummary("Get All Groups")
        .WithDescription("Get all active Groups. Optional Params: Limit, Offset, Search (Name, Members, Tag, ID)")
        .Produces<PaginatedRecord<Gangs>>(200);

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
            var jobId = await jobs.CreateJobAsync("gangsExport", new {});
            return Results.Accepted($"/jobs/{jobId}", new {jobId});
        })
        .RequireAuthorization("Staff")
        .WithSummary("Export All Groups Data")
        .WithDescription("Creates a job to export all Groups data into a CSV for download. Returns Job ID");

        group.MapPost("/{id}/export", async (string id, IJobService jobs) =>
        {
            var jobId = await jobs.CreateJobAsync("gangExport", new { gangId = id} );
            return Results.Accepted($"/jobs/{jobId}", new {jobId});
        })
        .RequireAuthorization("Staff")
        .WithSummary("Export A Groups Data")
        .WithDescription("Creates a job to export a Groups data into a CSV for download. Returns Job ID");

        return app;
    }
}