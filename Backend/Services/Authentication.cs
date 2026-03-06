using Microsoft.Data.SqlClient;
using DecsPage.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace DecsPage.Services;

public interface IAuthenticationService
{
    Task<IResult>GenerateToken (HttpContext ctx);
    Task Login ();
    Task Refresh ();
}

public class AuthenticationService : IAuthenticationService
{
    private readonly string connectionString;
    private readonly string expectedSecret;
    public readonly SecurityKey key;
    private readonly ILogger<AuthenticationService> _logger;
    public AuthenticationService(IConfiguration config, ILogger<AuthenticationService> logger)
    {
        connectionString = config.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Missing Default Connection");
        expectedSecret = config["AuthTokens:ClientSecret"]!;
        key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(config["Jwt:Key"] ?? throw new InvalidOperationException("Missing Default JWT Key")));
        _logger = logger;
    }

    public async Task<IResult> GenerateToken(HttpContext ctx)
    {
        if (!ctx.Request.Headers.TryGetValue("X-Auth-Secret", out var provided) ||
            !string.Equals(provided, expectedSecret, StringComparison.Ordinal))
        {
            return Results.Unauthorized();
        };

        var name  = ctx.Request.Query["name"].ToString();
        var group = ctx.Request.Query["group"].ToString();
        var perm = ctx.Request.Query["perms"].ToString();

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, name),
            new Claim("side", group),
            new Claim("scope", perm)
        };

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: "UserLogin",
            audience: "UserLogin",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds);

        return Results.Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token)
        }); 
    }
    public async Task Login ()
    {
        
    }  
    public async Task Refresh ()
    {
        
    }
}