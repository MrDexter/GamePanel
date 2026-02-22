using Microsoft.Extensions.Hosting;
using Scalar.AspNetCore;
using BackgroundJobs.Endpoints;
using BackgroundJobs.Services;
using BackgroundJobs.Background;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddScoped<IPlayerService, PlayerService>();
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<IProcessorService, ProcessorService>();
// For the Azure App Service test platform, Disable this and do a manual trigger on job creation to save on resources
// builder.Services.AddHostedService<JobWorker>();
builder.Services.AddScoped<IJobWorker, JobWorker>();

builder.Services.AddOpenApi(options => {
    options.AddDocumentTransformer((document, context, cancellationToken) => {
        document.Info.Title = "Dec's Background Worker & API Project";
        document.Info.Version = "v1.0.0";
        document.Info.Description = "Backend service for background task processing";
        return Task.CompletedTask;
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{}

app.UseHttpsRedirection();
app.MapJobEndpoints();
app.MapPlayerEndpoints();
app.MapMiscEndpoints();
app.MapOpenApi();
app.MapScalarApiReference();

app.MapGet("/", () => Results.Redirect("/scalar/"));

app.Run();
