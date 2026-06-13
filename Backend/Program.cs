using Scalar.AspNetCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;
using System.Text.Json;
using DecsPage.Endpoints;
using DecsPage.Services;
using DecsPage.Background;
using Microsoft.OpenApi;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Stripe;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
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
            ?? throw new InvalidOperationException("Missing Default JWT Key"))
        ),
        ClockSkew = TimeSpan.Zero 
    };

    // options.Events = new JwtBearerEvents
    // {
    //     OnAuthenticationFailed = context =>
    //     {
    //         Console.WriteLine("JWT AUTH FAILED:");
    //         Console.WriteLine(context.Exception.Message);
    //         return Task.CompletedTask;
    //     },
    //     OnChallenge = context =>
    //     {
    //         Console.WriteLine("JWT CHALLENGE:");
    //         Console.WriteLine(context.Error);
    //         Console.WriteLine(context.ErrorDescription);
    //         return Task.CompletedTask;
    //     },
    //     OnTokenValidated = context =>
    //     {
    //         Console.WriteLine("JWT VALIDATED");
    //         foreach (var claim in context.Principal!.Claims)
    //             Console.WriteLine($"{claim.Type}: {claim.Value}");

    //         return Task.CompletedTask;
    //     }
    // };
})
.AddSteam(options => 
{
    options.ApplicationKey = builder.Configuration["Steam:Key"];
    options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme; 
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Staff", policy =>
        policy.RequireClaim("adminlevel", "3", "4", "5", "6", "7", "8"));

    options.AddPolicy("SeniorStaff", policy => 
        policy.RequireClaim("adminlevel", "5", "6", "7", "8"));
});

builder.Services.AddSingleton(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var secretKey = config["Stripe:Secret"] ?? throw new InvalidOperationException("Stripe secret key is missing.");

    return new StripeClient(secretKey);
});

builder.Services.AddOpenApi();
builder.Services.AddScoped<IPlayerService, PlayerService>();
builder.Services.AddScoped<IGangService, GangService>();
builder.Services.AddScoped<ILoggingService, LoggingService>();
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<IProcessorService, ProcessorService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IStatsService, StatsService>();
builder.Services.AddScoped<IShopService, ShopService>();
// For the Azure App Service test platform, Disable this and do a manual trigger on job creation to save on resources
// builder.Services.AddHostedService<JobWorker>();
builder.Services.AddScoped<IJobWorker, JobWorker>();

// Scalar / Open API Tags, Information
builder.Services.AddOpenApi(options => {
    options.AddDocumentTransformer((document, context, cancellationToken) => {
        document.Info.Title = "Game Panel API";
        document.Info.Version = "v1.0.0";
        document.Info.Description = "Service to view and update Player information and export any data";
        document.Tags = new HashSet<OpenApiTag>
        {
            new() { Name = "Player Management", Description = "Real-time player statistics" },
            new() { Name = "Group Management", Description = "Group analytics and management" },
            new() { Name = "Job Management", Description = "Background worker controls" },
            new() { Name = "Statistics", Description = "Range of different Statistics"},
            new() { Name = "Security and Authentication", Description = "Security and Authentication" },
            new() { Name = "Logging", Description = "Logging Management"},
            new() { Name = "Shop", Description = "Shop Management"}
        };
        return Task.CompletedTask;
    });
});
// Cors for Frontend Support
builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.WithOrigins("http://localhost:5173", "https://panel.decspage.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
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

app.UseCors(); 
app.UseRouting();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapJobEndpoints();
app.MapPlayerEndpoints();
app.MapMiscEndpoints();
app.MapAuthEndpoints();
app.MapGangEndpoints();
app.MapStatsEndpoints();
app.MapShopEndpoints();
app.MapOpenApi();
app.MapScalarApiReference();

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