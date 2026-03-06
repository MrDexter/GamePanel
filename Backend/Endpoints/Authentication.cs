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
        var group = app.MapGroup("/auth").WithTags("Security and Misc");

        group.MapPost("/generate", (HttpContext ctx, IAuthenticationService auth) =>
        {
            var result = auth.GenerateToken(ctx);
            Results.Ok(result);
        })
        .WithSummary("Generate a JWT Token")
        .WithDescription("Generate a new JWT Token with specified params. Requires Auth Secret")
        .Produces(200);

        group.MapPost("/refresh", () =>
        {
            // Check if valid token

            // If Valid but expired, pull perms from db and generate a new
        });

        group.MapPost("/login", () =>
        {
           //  
        });



        return app;
    }  
}