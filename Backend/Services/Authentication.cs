using Microsoft.Data.SqlClient;
using DecsPage.Models;
using DecsPage.Constants;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using BCrypt.Net;

namespace DecsPage.Services;

public interface IAuthenticationService
{
    Task<string>GenerateToken (HttpContext context, UserDetails userDetails);
    Task <bool> GenerateGUID (HttpContext context, string id);
    Task <bool> DeleteGUID (HttpContext context, string guid);
    Task<LoginResponse> RefreshToken (HttpContext context, string guid);
    Task <LoginResponse> AuthenticateUser (string username, string password, HttpContext context);
    Task LogoutUser (HttpContext context);
    Task <string> CreateUser (string ID, string username, HttpContext context);
    Task<bool> DeleteUser (string id, HttpContext context);
    Task<string> AdminResetPassword (string id, HttpContext context);
    Task<string> ResetPassword (ResetPassword req, HttpContext context);
    Task<bool> ChangePassword (ChangePassword req, HttpContext context);
    Task<UserDetails> GetUserDetails (string column, string filter);
}

public class AuthenticationService : IAuthenticationService
{
    private readonly string connectionString;
    private readonly string expectedSecret;
    public readonly SecurityKey key;
    public readonly IPlayerService player;
    private readonly ILogger<AuthenticationService> _logger;
    public readonly ILoggingService logging;
    public AuthenticationService(IConfiguration config, ILogger<AuthenticationService> logger, IPlayerService playerService, ILoggingService loggingService)
    {
        connectionString = config.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Missing Default Connection");
        expectedSecret = config["AuthTokens:ClientSecret"]!;
        key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(config["Jwt:Key"] ?? throw new InvalidOperationException("Missing Default JWT Key")));
        player = playerService;        
        _logger = logger;
        logging = loggingService;
    }

    public async Task<string> GenerateToken(HttpContext context, UserDetails userDetails)
    {
        var steamID  = userDetails.SteamID;
        var playerPerms = await player.GetPlayerPerms(steamID);
        var claims = new List<Claim>
        {
            new Claim("Name", userDetails.UserName),
            new Claim("SteamID", steamID),
            new Claim("ChangePassword", userDetails.ChangePassword)
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
            if (!FactionPermissions.PromoteThresholds.TryGetValue(name, out int neededRank))
            {
                neededRank = 99;
            }
            if (value >= neededRank)
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
          var sql = "UPDATE users SET refreshToken = @guid, refreshTokenExpiry = @expiry WHERE steamid = @steamid AND isActive = 1";
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
    public async Task<bool> DeleteGUID (HttpContext context, string guid)
    {
        using var connection = new SqlConnection(connectionString);
        {
          await connection.OpenAsync();
          var sql = "UPDATE users SET refreshToken = null, refreshTokenExpiry = null WHERE refreshToken = @guid AND isActive = 1";
          using var command = new SqlCommand(sql, connection);
          command.Parameters.AddWithValue("@guid", guid);
          int reader = await command.ExecuteNonQueryAsync();
          if (reader == 0)
            {
                return false;
            };
            context.Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Domain = context.Request.Host.Host.Contains("localhost") ? null : ".decspage.com",
            });
          return true;
        };
    }
    public async Task<LoginResponse> RefreshToken (HttpContext context, string guid)
    {
            var userDetails = await GetUserDetails("RefreshToken", guid) ?? throw new UnauthorizedAccessException("User Not Found!");
            var success = await GenerateGUID(context, userDetails.SteamID);
            if (success)
            {
                var token = await GenerateToken(context, userDetails);
                var permissionsList = new Permissions(
                    AppPermissions.AdminPermissions   
                );
                var data = new LoginResponse(token, permissionsList);
                return data;
            };
            throw new InvalidOperationException("Failed to Generate GUID");
    }
    public async Task<LoginResponse> AuthenticateUser (string username, string password, HttpContext context)
    {
        var userDetails = await GetUserDetails("Username", username) ?? throw new UnauthorizedAccessException("Username Not Found!");
        if (!BCrypt.Net.BCrypt.Verify(password, userDetails.PasswordHash))
        {
            throw new UnauthorizedAccessException("Password is Incorrect!");
        }

        var success = await GenerateGUID(context, userDetails.SteamID);
        if (success)
        {
            var token = await GenerateToken(context, userDetails);
            var permissionsList = new Permissions(
                AppPermissions.AdminPermissions   
            );
            var data = new LoginResponse(token, permissionsList);
            await logging.AuditLog("Logged In", null!, userDetails.SteamID, "");
            return data;
        };
        
        throw new InvalidOperationException("GUID Failed to Generate!");
    }  
    public async Task LogoutUser(HttpContext context)
    {
        if (context.Request.Cookies.TryGetValue("refreshToken", out var guid))
        {
            await DeleteGUID(context, guid);
        }
    }
    public async Task<string> CreateUser (string ID, string username, HttpContext context)
    {
        if (!context.Request.Cookies.TryGetValue("refreshToken", out var guid))
        {   
            throw new InvalidDataException("Session token not found!"); // Request not from a Logged in user
        };
        var userDetails = await GetUserDetails("RefreshToken", guid!) ?? throw new InvalidDataException("Error Fetching user details");
        try {
            var password = GenerateRandomPassword();
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password); 
            using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();
                var sql = "INSERT INTO users (UserName, PasswordHash, AdminLevel, SteamID) VALUES (@username, @passwordHash, 0, @SteamID)";
                var command = new SqlCommand(sql, connection);
                command.Parameters.AddWithValue("@username", username);
                command.Parameters.AddWithValue("@passwordHash", passwordHash);
                command.Parameters.AddWithValue("@steamID", ID);
                await command.ExecuteNonQueryAsync();
            };
            await logging.AuditLog("User Create", ID, userDetails.SteamID, "");
            return password; 
        } catch (SqlException error) when (error.Number == 2627 || error.Number == 2601) // Duplicate Entry for Username or SteamID
        {
            if (error.Message.Contains("UQ_Users_SteamID"))
                throw new ApiException("This Steam ID already exists", "STEAMID_EXISTS");
                
            if (error.Message.Contains("UQ_Users_Username"))
                throw new ApiException("This Username already exists", "USERNAME_EXISTS");


            throw new InvalidOperationException("A record with these details already exists.");
        };
    }
    public async Task<bool>DeleteUser(string ID, HttpContext context)
    {
        if (!context.Request.Cookies.TryGetValue("refreshToken", out var guid))
        {   
            throw new InvalidDataException("Session token not found!"); // Request not from a Logged in user
        };
        var userDetails = await GetUserDetails("RefreshToken", guid!) ?? throw new InvalidDataException("Error Fetching user details");
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = "UPDATE users SET isActive = 0, deletedAt = @date WHERE SteamID = @id AND isActive = 1";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", ID);
            command.Parameters.AddWithValue("@date", DateTime.UtcNow);
            int reader = await command.ExecuteNonQueryAsync();
            if (reader > 0)
                await logging.AuditLog("User Disabled", ID, userDetails.SteamID, "");
                return true;
        };
        throw new InvalidDataException("User not Found");
    }
    public async Task<string> AdminResetPassword (string ID, HttpContext context)
    {
        if (!context.Request.Cookies.TryGetValue("refreshToken", out var guid))
        {   
            throw new InvalidDataException("Session token not found!"); // Request not from a logged in user
        };    
        var userDetails = await GetUserDetails("RefreshToken", guid!) ?? throw new InvalidDataException("Error Fetching user details");    
        var password = GenerateRandomPassword();
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password); 
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = "UPDATE users SET PasswordHash = @passwordHash, ChangePassword = 1, isActive = 1 WHERE SteamID = @steamID";
            var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@passwordHash", passwordHash);
            command.Parameters.AddWithValue("@steamID", ID);
            int reader = await command.ExecuteNonQueryAsync();
            if (reader > 0)
                await logging.AuditLog("User Account Reset", ID, userDetails.SteamID, "");
                return password;
        };
        throw new InvalidDataException("Failed to Update Password"); 
    }
    public async Task<string> ResetPassword(ResetPassword req, HttpContext context)
    {
        if (!context.Request.Cookies.TryGetValue("refreshToken", out var guid))
        {   
            throw new InvalidDataException("Session token not found!");  
        };
        if (req.Password != req.ConfirmPassword)
        {
            throw new InvalidDataException("Passwords do not match");
        };
        var hashedPass = BCrypt.Net.BCrypt.HashPassword(req.Password);
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = "UPDATE users SET PasswordHash = @pass, changePassword = 0 WHERE RefreshToken = @guid AND isActive = 1";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@pass", hashedPass);
            command.Parameters.AddWithValue("@guid", guid);
            int reader = await command.ExecuteNonQueryAsync();
            if (reader == 0)
            {
                throw new InvalidDataException("Session not found or expired");
            };
        };
        var userDetails = await GetUserDetails("RefreshToken", guid!) ?? throw new InvalidDataException("Error Fetching user details");
        var token = await GenerateToken(context, userDetails);
        await logging.AuditLog("Password Reset", null!, userDetails.SteamID, "");
        return token!;
    }
    public async Task<bool> ChangePassword(ChangePassword req, HttpContext context)
    {
        if (!context.Request.Cookies.TryGetValue("refreshToken", out var guid))
        {   
            throw new InvalidDataException("Session token not found!");  
        };
        var userDetails = await GetUserDetails("RefreshToken", guid!) ?? throw new InvalidDataException("Error Updating User");
        if (!BCrypt.Net.BCrypt.Verify(req.OldPassword, userDetails.PasswordHash))
        {
            throw new InvalidDataException("Old Password is incorrect!");
        }        
        if (req.NewPassword != req.ConfirmNewPassword)
        {
            throw new InvalidDataException("Passwords do not match");
        };
        var hashedPass = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = "UPDATE users SET PasswordHash = @pass, changePassword = 0 WHERE RefreshToken = @guid AND isActive = 1";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@pass", hashedPass);
            command.Parameters.AddWithValue("@guid", guid);
            int reader = await command.ExecuteNonQueryAsync();
            if (reader > 0)
            {
                await logging.AuditLog("Password Change", null!, userDetails.SteamID, "");
                return true; 
            };
            throw new InvalidDataException("Session not found or expired");
        };
    }
    public async Task<UserDetails> GetUserDetails(string column, string filter)
    {       
        var allowedColumns = new[] { "Username", "SteamID", "RefreshToken" };
        if (!allowedColumns.Contains(column)) {
            throw new ArgumentException("Invalid search column.");
        }
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = $"SELECT id, Username, PasswordHash, AdminLevel, SteamID, changePassword, isActive FROM users WHERE {column} = @filter";
            using var command = new SqlCommand(sql, connection); 
            command.Parameters.AddWithValue("@filter", filter);
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                Console.WriteLine(reader["isActive"]);
                if (!Convert.ToBoolean(reader["isActive"])) throw new UnauthorizedAccessException("Account is disabled!");
                return new UserDetails(
                    int.Parse(reader["id"].ToString() ?? string.Empty),
                    reader["Username"].ToString() ?? string.Empty,
                    reader["PasswordHash"].ToString() ?? string.Empty,
                    int.Parse(reader["AdminLevel"].ToString() ?? string.Empty),
                    reader["SteamID"].ToString() ?? string.Empty,
                    reader["changePassword"].ToString() ?? string.Empty
                );
            };
            throw new UnauthorizedAccessException(column + " cannot be found!");
        };
    }
    private static string GenerateRandomPassword(int length = 12)
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[random.Next(s.Length)]).ToArray());
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