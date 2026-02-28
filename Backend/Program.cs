using Microsoft.Extensions.Hosting;
using Scalar.AspNetCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json;
using DecsPage.Endpoints;
using DecsPage.Services;
using DecsPage.Background;
using Microsoft.OpenApi;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
// using Microsoft.AspNetCore.HealthChecks.AzureStorage;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication("Bearer").AddJwtBearer("Bearer", options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
      ValidateIssuer = true,
      ValidateAudience = true,
      ValidateLifetime = true,
      ValidateIssuerSigningKey = true, 

      ValidIssuer = builder.Configuration["Jwt:Issuer"],
      ValidAudience = builder.Configuration["Jwt:Audience"],

      IssuerSigningKey = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]
        ?? throw new InvalidOperationException("Missing Default Key"))
      )
    };
});

builder.Services.AddAuthentication();
builder.Services.AddAuthorization();
builder.Services.AddOpenApi();
builder.Services.AddScoped<IPlayerService, PlayerService>();
builder.Services.AddScoped<IGangService, GangService>();
builder.Services.AddScoped<ISecurityService, SecurityService>();
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<IProcessorService, ProcessorService>();
// For the Azure App Service test platform, Disable this and do a manual trigger on job creation to save on resources
// builder.Services.AddHostedService<JobWorker>();
builder.Services.AddScoped<IJobWorker, JobWorker>();

// Scalar / Open API Tags, Information
builder.Services.AddOpenApi(options => {
    options.AddDocumentTransformer((document, context, cancellationToken) => {
        document.Info.Title = "Dec's Background Worker & API Project";
        document.Info.Version = "v1.0.0";
        document.Info.Description = "Service to view and update Player information and export any data";
        document.Tags = new HashSet<OpenApiTag>
        {
            new() { Name = "Player Management", Description = "Real-time player statistics" },
            new() { Name = "Gang Management", Description = "Gang analytics and management" },
            new() { Name = "Job Management", Description = "Background worker controls" },
            new() { Name = "Security and Misc", Description = "Authentication and Authorization" }
        };
        return Task.CompletedTask;
    });
});
// Cors for Frontend Support
builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.WithOrigins("http://localhost:5173", "https://decspage.com")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Health report for the Frontend Check
builder.Services.AddHealthChecks()
    .AddSqlServer(builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new Exception("No Default Connection"))
     .AddAzureBlobStorage(builder.Configuration["Storage:ConnectionString"] ?? throw new Exception("No Storage Default Connection"), containerName: builder.Configuration["Storage:Container"]);


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{};

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapJobEndpoints();
app.MapPlayerEndpoints();
app.MapMiscEndpoints();
app.MapAuthEndpoints();
app.MapGangEndpoints();
app.MapOpenApi();
app.MapScalarApiReference();
app.UseCors();

app.MapGet("/", () => Results.Redirect("/scalar/")).ExcludeFromDescription();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        var result = JsonSerializer.Serialize(new
        {
            status = report.Status.ToString(), // "Healthy", "Degraded", or "Unhealthy"
            services = report.Entries.Select(e => new { 
                name = e.Key, 
                status = e.Value.Status.ToString() 
            })
        });
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(result);
    }
});

app.Run();