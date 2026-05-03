using DecsPage.Models;
using DecsPage.Services;
using Microsoft.AspNetCore.Mvc;

namespace DecsPage.Endpoints;

public static class ShopEndpoints
{
    public static IEndpointRouteBuilder MapShopEndpoints (this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/shop").WithTags("Shop");

        group.MapGet("/products", async (IShopService shop, string? search, string? orderby, string? direction) =>
        {
            var products = await shop.GetProducts(search, orderby, direction);
            var productsList = products.Values.ToList();
            return Results.Ok(new {products = productsList, totalProducts = products.Count()});
        })
        .WithSummary("Get All Products")
        .WithDescription("Get a list of all items available on the shop");

        group.MapGet("/product", async (string id, IShopService shop) =>
        {
            try
            {
                var item = shop.GetItem(id);
                return Results.Ok(item);
                
            } catch (InvalidOperationException)
            {
                return Results.NotFound("Item Not Found");
            }
        })
        .WithSummary("Get a Specific Product")
        .WithDescription("Get a specific Item using the Item ID");

        group.MapPost("/create-checkout-session", async ([FromBody] CreateCheckoutSessionRequest request, IShopService shop, CancellationToken cancellationToken) =>
        {
            try
            {
                var result = await shop.CreateCheckoutSessionAsync(request, cancellationToken);
                return Results.Ok(result);
            }
            catch (InvalidOperationException error)
            {
                return Results.BadRequest(new { message = error.Message });
            }
            catch (InvalidDataException error)
            {
                return Results.BadRequest(new { message = error.Message});
            }
        })
        .Produces<CreateCheckoutSessionResponse>(200)
        .Produces(400);

        group.MapGet("/session-status", async ( [FromQuery(Name = "session_id")] string sessionId, IShopService shop, IJobService jobs, CancellationToken cancellationToken) =>
            {
                var result = await shop.GetSessionStatusAsync(sessionId, cancellationToken);

                if (result.Status == "complete" && result.PaymentStatus == "paid")
                {
                    var jobId = await jobs.CreateJobAsync("orderFulfilment", new { orderId = result.OrderId.ToString()} );
                }

                return Results.Ok(result);
            })
            .Produces<CheckoutSessionStatusResponse>(200);

        return app;
    }
}