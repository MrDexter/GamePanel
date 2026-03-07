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

        group.MapPost("/generateToken", (HttpContext ctx, IAuthenticationService auth) =>
        {
            // var result = auth.GenerateToken(ctx);
            Results.Ok();
        })
        .RequireAuthorization()
        .WithSummary("Generate a JWT Token")
        .WithDescription("Generate a new JWT Token with specified params. Requires Auth Secret")
        .Produces(200);

        group.MapPost("/refreshToken", (HttpContext context) =>
        {
            if (!context.Request.Cookies.TryGetValue("refreshToken", out var oldGuid))
            {
                return "None";
            };
            // Refresh GUID
            // Refresh JWT
            return oldGuid;
        })
        // .RequireAuthorization()
        .WithSummary("Refresh a JWT Token")
        .WithDescription("Refresh a JWT Token. Requires JWT Token")
        .Produces(200);

        group.MapPost("/login", async (LoginRequest req, IAuthenticationService auth, HttpContext context) =>
        {
           var token = await auth.AuthenticateUser(req.Username, req.Password, context);

           if (token is null) return Results.Unauthorized();

           return Results.Ok(new { token });   
        })
        .AllowAnonymous()
        .WithSummary("Login")
        .WithDescription("Login to a User Account. Requires Username and Password")
        .Produces(200);

        group.MapPost("/createUser", async (string ID, string username, IAuthenticationService auth) =>
        {
           var password = await auth.CreateUser(ID, username);

            return Results.Ok(password);

        })
        // .RequireAuthorization()
        .WithSummary("Create a User")
        .WithDescription("Create a User. Requires a Vaid JWT Token")
        .Produces(200);

        group.MapPost("/deleteUser", () =>
        {
           //  
        })
        // .RequireAuthorization()
        .RequireAuthorization()
        .WithSummary("Delete a User")
        .WithDescription("Delete a User. Requires a Valid JWT Token")
        .Produces(200);

        group.MapPost("/resetPassword", () =>
        {
           //  
        })
        .RequireAuthorization()
        .WithSummary("Reset User Password")
        .WithDescription("Reset a Users Password. Requires a Valid JWT Token")
        .Produces(200);

        group.MapPost("/changePassword", () =>
        {
           //  
        })
        .RequireAuthorization()
        .WithSummary("Change User Password")
        .WithDescription("Change a Users Password. Requires a Valid JWT Token")
        .Produces(200);



        return app;
    }  
}