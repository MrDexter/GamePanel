using Microsoft.Extensions.Hosting;
using Scalar.AspNetCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using DecsPage.Endpoints;
using DecsPage.Services;
using DecsPage.Background;
using Microsoft.OpenApi;

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

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{}

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

app.MapGet("/", () => Results.Redirect("/scalar/")).ExcludeFromDescription();;

app.Run();