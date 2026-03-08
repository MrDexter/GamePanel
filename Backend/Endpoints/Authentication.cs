using DecsPage.Models;
using DecsPage.Services;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

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

        group.MapPost("/refreshToken", async(HttpContext context, IAuthenticationService auth) =>
        {
            if (!context.Request.Cookies.TryGetValue("refreshToken", out var oldGuid))
            {
                return Results.Unauthorized(); // no token exists, user needs to log back in
            };
            var token = await auth.RefreshToken(context, oldGuid);
            return Results.Ok( new {token}); // Return new JWT to frontEnd
        })
        // .RequireAuthorization()
        .WithSummary("Refresh a JWT Token")
        .WithDescription("Refresh a JWT Token. Requires JWT Token")
        .Produces(200);

        group.MapPost("/login", async (LoginRequest req, IAuthenticationService auth, HttpContext context) =>
        {
           var token = await auth.AuthenticateUser(req.Username, req.Password, context);

           if (token is null) return Results.NotFound(new {message = "Username or Password Incorrect"});

           return Results.Ok(new { token });   
        })
        .AllowAnonymous()
        .WithSummary("Login")
        .WithDescription("Login to a User Account. Requires Username and Password")
        .Produces(200);

        group.MapPost("/logout", async (IAuthenticationService auth, HttpContext context) =>
        {
           await auth.LogoutUser(context);
           return Results.Ok(new { message = "Logged out" });   
        })
        .AllowAnonymous()
        .WithSummary("Logout")
        .WithDescription("Logout a User Account. Wipes the GUID Cookie")
        .Produces(200);

        group.MapPost("/createUser", async (string ID, string username, HttpContext context, IAuthenticationService auth) =>
        {
            try {
                var password = await auth.CreateUser(ID, username, context);
                return Results.Ok( new { password = password});
            } catch (InvalidOperationException error)
            {
                return Results.Conflict(new { message = error.Message });
            };
        })
        // .RequireAuthorization()
        .WithSummary("Create a User")
        .WithDescription("Create a User. Requires a Vaid JWT Token")
        .Produces(200);

        group.MapPost("/deleteUser", async (string id, HttpContext context, IAuthenticationService auth) =>
        {
            try {
                await auth.DeleteUser(id, context);
                return Results.Ok(new {message = $"Account with ID ${id}. Successfully Deleted"});
            } catch (InvalidDataException ex) {
                return Results.NotFound(new {message = ex.Message}); 
            }; 
        })
        // .RequireAuthorization()
        .WithSummary("Delete a User")
        .WithDescription("Delete a User. Requires a Valid JWT Token")
        .Produces(200);

        group.MapPost("/adminResetPassword", async (string id, HttpContext context, IAuthenticationService auth) =>
        {
            try {
                var password = await auth.AdminResetPassword(id, context);  
                return Results.Ok(new { password = password});
            } catch (InvalidDataException ex) {
                return Results.NotFound(new {message = ex.Message}); 
            };
        })
        // .RequireAuthorization()
        .WithSummary("Reset Users Password")
        .WithDescription("Reset a Users Password. Requires a Valid JWT Token")
        .Produces(200);

        group.MapPost("/resetPassword", async (ResetPassword req, IAuthenticationService auth, HttpContext context) =>
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
        // .RequireAuthorization()
        .WithSummary("Reset Password")
        .WithDescription("Reset Password Without Old Password.")
        .Produces(200);

        group.MapPost("/changePassword", async (ChangePassword req, IAuthenticationService auth, HttpContext context) =>
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
        // .RequireAuthorization()
        .WithSummary("Change User Password")
        .WithDescription("Change a Users Password. Requires a Valid JWT Token")
        .Produces(200);



        return app;
    }  
}