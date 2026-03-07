using Microsoft.Data.SqlClient;
using DecsPage.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using BCrypt.Net;

namespace DecsPage.Services;

public interface IAuthenticationService
{
    Task<string?>GenerateToken (UserDetails userDetails);
    Task <bool> GenerateGUID (HttpContext context, string id);
    Task <string?> AuthenticateUser (string username, string password, HttpContext context);
    Task <string> CreateUser (string ID, string username);
}

public class AuthenticationService : IAuthenticationService
{
    private readonly string connectionString;
    private readonly string expectedSecret;
    public readonly SecurityKey key;
    public readonly IPlayerService player;
    private readonly ILogger<AuthenticationService> _logger;
    public AuthenticationService(IConfiguration config, ILogger<AuthenticationService> logger, IPlayerService playerService)
    {
        connectionString = config.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Missing Default Connection");
        expectedSecret = config["AuthTokens:ClientSecret"]!;
        key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(config["Jwt:Key"] ?? throw new InvalidOperationException("Missing Default JWT Key")));
        player = playerService;        
        _logger = logger;
    }

    public async Task<string?> GenerateToken(UserDetails userDetails)
    {
        var steamID  = userDetails.SteamID;
        var playerPerms = await player.GetPlayerPerms(steamID);
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, userDetails.UserName),
            new Claim("SteamID", steamID)
        };
        var properties = typeof(PlayerPerms).GetProperties();
        foreach (var data in properties)
        {
             if (data.PropertyType != typeof(int)) continue;
            var name = data.Name.ToLower();
            var value = (int)data.GetValue(playerPerms)!;
            if (name == "adminlevel")
            {
                value = Math.Max(userDetails.AdminLevel, playerPerms.AdminLevel); // Allow User Admin level to Override Player Admin Level
            }
            var neededRank = CanPromote(name);
            if (value > neededRank)
            {
               claims.Add(
                    new Claim(name.ToString(), value.ToString())
               );
            };
        };

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: "DecsPage",
            audience: "Dashboard",
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: creds
        );
        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
        return  tokenString; 
    }
    public async Task<bool> GenerateGUID (HttpContext context, string id)
    {
        var guid = Guid.NewGuid().ToString();
        var expiry = DateTime.UtcNow.AddHours(24);
        using var connection = new SqlConnection(connectionString);
        {
          await connection.OpenAsync();
          var sql = "UPDATE users SET refreshToken = @guid, refreshTokenExpiry = @expiry WHERE steamid = @steamid";
          using var command = new SqlCommand(sql, connection);
          command.Parameters.AddWithValue("@guid", guid);
          command.Parameters.AddWithValue("@expiry", expiry);
          command.Parameters.AddWithValue("@steamid", id);
          int reader = await command.ExecuteNonQueryAsync();
          if (reader == 0)
            {
                return false;
            };
          var cookieOptions = new CookieOptions
          {
              HttpOnly = true,
              Secure = true,
              SameSite = SameSiteMode.None,
              Domain = context.Request.Host.Host.Contains("localhost") ? null : ".decspage.com",
              Expires = DateTime.UtcNow.AddHours(24)
          };
          context.Response.Cookies.Append("refreshToken", guid, cookieOptions);
          return true;
        };
    }
    public async Task<string?> AuthenticateUser (string username, string password, HttpContext context)
    {
        UserDetails? userDetails = null;
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = "SELECT id, Username, PasswordHash, AdminLevel, SteamID FROM users WHERE username = @username";
            using var command = new SqlCommand(sql, connection); 
            command.Parameters.AddWithValue("@username", username);
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                userDetails = new UserDetails(
                    int.Parse(reader["id"].ToString() ?? string.Empty),
                    reader["Username"].ToString() ?? string.Empty,
                    reader["PasswordHash"].ToString() ?? string.Empty,
                    int.Parse(reader["AdminLevel"].ToString() ?? string.Empty),
                    reader["SteamID"].ToString() ?? string.Empty
                );
            };
            if (userDetails == null || !BCrypt.Net.BCrypt.Verify(password, userDetails.PasswordHash))
            {
                return null!;
            }
        }; 

        var success = await GenerateGUID(context, userDetails.SteamID);
        if (success)
        {
            var token = await GenerateToken(userDetails);
            return token;
        };
        return null;
        
    }  
    public async Task<string> CreateUser (string ID, string username)
    {   
        var password = GenerateRandomPassword();
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password); 
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = "INSERT INTO users (UserName, PasswordHash, AdminLevel, SteamID) VALUES (@username, @passwordHash, 0, @SteamID)";
            var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@username", username);
            command.Parameters.AddWithValue("passwordHash", passwordHash);
            command.Parameters.AddWithValue("@steamID", ID);
            int reader = await command.ExecuteNonQueryAsync();
            if (reader == 0)
            {
                return null!;
            };
        };
        return password;   
    }

    public string GenerateRandomPassword(int length = 12)
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    public int CanPromote(string playerRank)
    {
        return playerRank switch {
            "adminlevel" => 1,
            "coplevel" => 7,
            "tfulevel" => 4,
            "ncalevel" => 4,
            "npaslevel" => 4,
            "mpulevel" => 4,
            "acadlevel" => 2,
            "ionlevel" => 6,
            "deltalevel" => 4,
            "umlevel" => 4,
            "iaflevel" => 4,
            "irulevel" => 3,
            "mediclevel" => 4,
            "hemslevel" => 4,
            "hartlevel" => 4,
            "rplevel" => 4,
            _ => 99,
        };
    }


/*     public async Task<IResult> OldGenerateToken(UserDetails userDetails)
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
    }  */
}