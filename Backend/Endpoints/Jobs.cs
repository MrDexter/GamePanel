using DecsPage.Models;
using DecsPage.Services;
// using Microsoft.AspNetCore.Authorization;

namespace DecsPage.Endpoints;

public static class JobEndpoints
{
    public static IEndpointRouteBuilder MapJobEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/jobs").WithTags("Job Management");

        group.MapGet("/", async (IJobService jobs) =>
        {
            var result = await jobs.GetJobsAsync();
            return Results.Ok(result);
        })
        .WithSummary("Get All Pending Jobs")
        .WithDescription("Retrieve all jobs that have not been completed");

        group.MapGet("/{id}", async (string id, IJobService jobs) =>
        {
            var result = await jobs.GetJobAsync(id);
            if (result is null)
            {return Results.NotFound();};
            return Results.Ok(result);
        })
        .WithSummary("Get a Job")
        .WithDescription("Retrieve a job by ID")
        .Produces<List<Job>>(200);

        group.MapGet("/failed", async (IJobService jobs) =>
        {
            var result = await jobs.GetFailedJobsAsync();
            return Results.Ok(result);
        })
        .WithSummary("Get All Failed Jobs")
        .WithDescription("Get a list of all failed jobs")
        .Produces<List<Job>>(200);

/*         group.MapGet("/{id}/cancel", async (string id, IJobService jobs) =>
        {
            // Get Job, If Incomplete, Mark as Cancelled.
            // In Job check status not canclled
        }); */

        group.MapGet("/{id}/reset", async (string id, IJobService jobs) =>
        {
           var result = await jobs.ResetJobState(id);
           if (result)
            {
                return Results.Ok("Success");
            } else {
                return Results.NotFound();
            };
        })
        .WithSummary("Reset / Restart a Job")
        .WithDescription("Reset a failed Job or Restart a completed job. Required Job ID.")
        .Produces<List<Job>>(200);

        group.MapGet("/{id}/download", async (string id, IJobService jobs, IProcessorService processor) =>
        {
            var job = await jobs.GetJobAsync(id);
            if (job is null || job.Status != "Complete" || string.IsNullOrEmpty(job.Result))
                {return Results.NotFound();};
            var url = await processor.GetDownloadUrl(job.Result, TimeSpan.FromMinutes(5));
            
            return Results.Redirect(url);
        })
        .WithSummary("Download a Jobs File")
        .WithDescription("Download a file assosiated with a job. Required Job ID.");

        return app;
    }
}