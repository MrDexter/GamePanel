using DecsPage.Models;
using DecsPage.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;


namespace DecsPage.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/auth").WithTags("Security and Authentication");

/*         group.MapPost("/generateToken", (HttpContext ctx, IAuthenticationService auth) =>
        {
            // var result = auth.GenerateToken(ctx);
            Results.Ok();
        })
        .RequireAuthorization()
        .WithSummary("Generate a JWT Token")
        .WithDescription("Generate a new JWT Token with specified params. Requires Auth Secret")
        .Produces(200); */

        group.MapPost("/refreshToken", async(HttpContext context, IAuthService auth) =>
        {
            if (!context.Request.Cookies.TryGetValue("refreshToken", out var oldGuid))
            {
                return Results.Unauthorized(); // no token exists, user needs to log back in
            };
            try {
                var data = await auth.RefreshToken(context, oldGuid);
                return Results.Ok(data);
            } catch (InvalidOperationException error)
            {
                return Results.Json(new { message = error.Message}, statusCode: 500);
            }
        })
        .WithSummary("Refresh a JWT Token")
        .WithDescription("Refresh a JWT Token. Requires JWT Token")
        .Produces<LoginResponse>(200);

        group.MapPost("/login", async (LoginRequest req, IAuthService auth, HttpContext context) =>
        {
            try {
                var data = await auth.AuthenticateUser(req.Username, req.Password, context);
                return Results.Ok(data);   
            } catch (UnauthorizedAccessException error)
            {
                return Results.BadRequest(new {message = error.Message});
            } catch (InvalidOperationException error)
            {
                return Results.Json(new { message = error.Message}, statusCode: 500);
            }
        })
        .AllowAnonymous()
        .WithSummary("Login")
        .WithDescription("Login to a User Account. Requires Username and Password")
        .Produces(200);

        group.MapGet("/steamLogin", (HttpContext context, string? currentUrl) =>
        {
            return Results.Challenge(
                properties: new AuthenticationProperties 
                { 
                    RedirectUri = $"/auth/steamCallback?currentUrl={currentUrl}" 
                },
                authenticationSchemes: new[] { "Steam" } 
            );
        })
        .AllowAnonymous()
        .WithSummary("Steam Login")
        .Produces(302);

        group.MapGet("/steamCallback", async (HttpContext context, string? currentUrl, IAuthService auth) =>
        {
            // 1. Authenticate against the temporary Cookie scheme
            var result = await context.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            if (!result.Succeeded || result.Principal == null)
            {
                return Results.BadRequest("Steam authentication failed.");
            }

            var steamUrl = result.Principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var steamId64 = steamUrl?.Split('/').Last();

            if (string.IsNullOrEmpty(steamId64))
            {
                return Results.BadRequest("Could not retrieve SteamID.");
            }
            if (string.IsNullOrEmpty(currentUrl))
            {
                currentUrl = "https://decspage.com/";
            }
            var token = await auth.SteamLogin(context, steamId64);
            string separator = currentUrl.Contains("?") ? "&" : "?" ?? "?";
            var url = $"{currentUrl}{separator}token={token}";
            return Results.Redirect(url);
        })
        .AllowAnonymous()
        .WithSummary("Steam Callback")
        .Produces(200);

        group.MapPost("/logout", async (IAuthService auth, HttpContext context) =>
        {
           await auth.LogoutUser(context);
           return Results.Ok(new { message = "Logged out" });   
        })
        .AllowAnonymous()
        .WithSummary("Logout")
        .WithDescription("Logout a User Account. Wipes the GUID Cookie")
        .Produces(200);

        group.MapPost("/createUser", async (string ID, string username, HttpContext context, IAuthService auth) =>
        {
            try {
                var password = await auth.CreateUser(ID, username, false, context);
                return Results.Ok( new { password = password});
            } catch (ApiException error)
            {
                return Results.Conflict(new { message = error.Message, code = error.Code });
            };
        })
        .RequireAuthorization("Staff")
        .WithSummary("Create a User")
        .WithDescription("Create a User. Requires a Vaid JWT Token")
        .Produces(200);

        group.MapPost("/deleteUser", async (string id, HttpContext context, IAuthService auth) =>
        {
            try {
                await auth.DeleteUser(id, context);
                return Results.Ok(new {message = $"Account with ID ${id}. Successfully Deleted"});
            } catch (InvalidDataException ex) {
                return Results.NotFound(new {message = ex.Message}); 
            }; 
        })
        .RequireAuthorization("SeniorStaff")
        .WithSummary("Delete a User")
        .WithDescription("Delete a User. Requires a Valid JWT Token")
        .Produces(200);

        group.MapPost("/adminResetPassword", async (string id, HttpContext context, IAuthService auth) =>
        {
            try {
                var password = await auth.AdminResetPassword(id, context);  
                return Results.Ok(new { password = password});
            } catch (InvalidDataException ex) {
                return Results.NotFound(new {message = ex.Message}); 
            };
        })
        .RequireAuthorization("Staff")
        .WithSummary("Reset Users Password")
        .WithDescription("Reset a Users Password. Requires a Valid JWT Token")
        .Produces(200);

        group.MapPost("/resetPassword", async (ResetPassword req, IAuthService auth, HttpContext context) =>
        {
            if (!context.Request.Cookies.TryGetValue("refreshToken", out var Guid))
            {
                return Results.Unauthorized(); // no token exists, user needs to log back in
            };
            try {
                var token = await auth.ResetPassword(req, context);
                return Results.Ok(new {message = "Password Updated Successfully", token = token});
            } catch (InvalidDataException ex) {
                return Results.BadRequest(new {message = ex.Message}); 
            };
        })
        .RequireAuthorization()
        .WithSummary("Reset Password")
        .WithDescription("Reset Password Without Old Password.")
        .Produces(200);

        group.MapPost("/changePassword", async (ChangePassword req, IAuthService auth, HttpContext context) =>
        {
            if (!context.Request.Cookies.TryGetValue("refreshToken", out var Guid))
            {
                return Results.Unauthorized(); // no token exists, user needs to log back in
            };
            try {
                await auth.ChangePassword(req, context); 
                return Results.Ok(new {message = "Password Updated Successfully"});
            } catch (InvalidDataException ex) {
                return Results.BadRequest(new {message = ex.Message}); 
            };
        })
        .RequireAuthorization()
        .WithSummary("Change User Password")
        .WithDescription("Change a Users Password. Requires a Valid JWT Token")
        .Produces(200);



        return app;
    }  
}