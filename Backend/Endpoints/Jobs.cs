using BackgroundJobs.Models;
using BackgroundJobs.Services;
// using Microsoft.AspNetCore.Authorization;

namespace BackgroundJobs.Endpoints;

public static class JobEndpoints
{
    public static IEndpointRouteBuilder MapJobEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/jobs");

        group.MapGet("/", async (IJobService jobs) =>
        {
            var result = await jobs.GetJobsAsync();
            return Results.Ok(result);
        });

        group.MapGet("/{id}", async (string id, IJobService jobs) =>
        {
            var result = await jobs.GetJobAsync(id);
            if (result is null)
            {return Results.NotFound();};
            return Results.Ok(result);
        });

        group.MapGet("/failed", async (IJobService jobs) =>
        {
           // Returned all failed, Maybe Canceled too? 
        });

        group.MapGet("/{id}/cancel", async (string id, IJobService jobs) =>
        {
            // Get Job, If Incomplete, Cancel. Add Authorization
        });

        group.MapGet("/{id}/reset", async (string id, IJobService jobs) =>
        {
           // Get Job, if Failed, Canceled etc. Reset to Incomplete 
        });

        group.MapGet("/{id}/download", async (string id, IJobService jobs, IProcessorService processor) =>
        {
            var job = await jobs.GetJobAsync(id);
            if (job is null || job.Status != "Complete" || string.IsNullOrEmpty(job.Result))
                {return Results.NotFound();};
            var url = await processor.GetDownloadUrl(job.Result, TimeSpan.FromMinutes(5));
            
            return Results.Redirect(url);
        });

        return app;
    }
}