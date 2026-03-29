using DecsPage.Models;
using DecsPage.Services;
using System.Text.Json;
using Microsoft.SqlServer.Server;
// using Microsoft.AspNetCore.Authorization;

namespace DecsPage.Endpoints;

public static class JobEndpoints
{
    public static IEndpointRouteBuilder MapJobEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/jobs").WithTags("Job Management");

        group.MapGet("/", async (IJobService jobs, string? search, string? statuses, int? limit, int? offset) =>
        {
            var result = await jobs.GetJobsAsync(search, statuses, limit, offset);
            return Results.Ok(result);
        })
        .WithSummary("Get All Jobs")
        .WithDescription("Retrieve all jobs as per params")
        .Produces<List<Job>>(200);

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

        group.MapPost("/{id}/duplicate", async (string id, IJobService jobs) =>
        {
            try
            {
                var job = await jobs.GetJobAsync(id);
                if (job is null)
                    return Results.NotFound(new { message = "Job not found!" });

                var payloadObject = JsonSerializer.Deserialize<Dictionary<string, object>>(job.Payload);
                var newId = await jobs.CreateJobAsync(job.Type, payloadObject);
                
                return Results.Accepted($"/jobs/{newId}", new {newId});
            } catch (InvalidDataException error)
            {
                return Results.BadRequest(new {message = error.Message});
            }
        })
        .RequireAuthorization("SeniorStaff")
        .WithSummary("Duplcate Job")
        .WithDescription("Create a new job with the same details as this job")
        .Produces(200);

        group.MapPost("/{id}/cancel", async (string id, IJobService jobs) =>
        {
            try
            {
                var job = await jobs.GetJobAsync(id);
                if (job is null)
                    return Results.NotFound(new { message = "Job not found!" });
                if (job.Status == "Complete")
                    return Results.BadRequest(new { message = "Job is already Complete!"});
                await jobs.UpdateJobStatusAsync(id, "Cancel", "");
                return Results.Ok(new {message = "Job has been set to Cancell!"}); 
            } catch (InvalidDataException error)
            {
                return Results.BadRequest(new {message = error.Message});
            }
        })
        .RequireAuthorization("SeniorStaff")
        .WithSummary("Cancel a Job")
        .WithDescription("Cancel a job that hasn't been completed yet")
        .Produces(200);

        group.MapPost("/{id}/reset", async (string id, IJobService jobs) =>
        {
            try
            {
                var job = await jobs.GetJobAsync(id);
                if (job is null)
                    return Results.NotFound(new { message = "Job not found!" });
                if (job.Status != "Failed")
                    return Results.BadRequest(new { message = "The job has not Failed!"});
                await jobs.UpdateJobStatusAsync(id, "Incomplete", "");
                return Results.Ok("Job has been reset!");
            } catch (InvalidDataException error)
            {
                return Results.NotFound(new {message = error.Message});
            }
        })
        .RequireAuthorization("SeniorStaff")
        .WithSummary("Reset / Restart a Job")
        .WithDescription("Reset a failed Job or Restart a completed job. Required Job ID.")
        .Produces<List<Job>>(200);

        group.MapPost("/{id}/priority", async (string id, IJobService jobs) =>
        {
            try
            {
                var job = await jobs.GetJobAsync(id);
                if (job is null)
                    return Results.NotFound(new { message = "Job not found!" });
                if (job.Status != "Complete")
                    return Results.BadRequest(new { message = "Job is already " + job.Status});
                var toggleTo = !Convert.ToBoolean(job.Priority);
                await jobs.TogglePriority(id, toggleTo);
                
                return Results.Ok(new {message = "Toggle State has been changed to: " + toggleTo}); 
            } catch (InvalidDataException error)
            {
                return Results.BadRequest(new {message = error.Message});
            }
        })
        .RequireAuthorization("SeniorStaff")
        .WithSummary("Toggle Priority of Job")
        .WithDescription("Set the job to be either Priority or Not")
        .Produces(200);

        group.MapGet("/{id}/download", async (string id, bool? direct, IJobService jobs, IProcessorService processor) =>
        {
            bool isDirect = direct ?? true;
            try {
                var job = await jobs.GetJobAsync(id);
                if (job is null)
                    return Results.NotFound(new { message = "Job not found." });
                if (job.Status != "Complete")
                    return Results.BadRequest(new { message = "Job is not complete." });
                if (string.IsNullOrEmpty(job.Result))
                    return Results.BadRequest(new { message = "Job result is missing." });
                
                var url = await processor.GetDownloadUrl(job.Result, TimeSpan.FromMinutes(5));
                
                if (isDirect)
                    return Results.Redirect(url);
                return Results.Ok(new {url = url});
            } catch (InvalidDataException error)
            {
                return Results.NotFound( new { message = error.Message});
            }
        })
        .RequireAuthorization("SeniorStaff")
        .WithSummary("Download a Jobs File")
        .WithDescription("Download a file associated with a job. Requires a job ID.");

        return app;
    }
}