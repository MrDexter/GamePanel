using DecsPage.Models;
using DecsPage.Services;
using Microsoft.AspNetCore.Mvc;

namespace DecsPage.Endpoints;

public static class ShopEndpoints
{
    public static IEndpointRouteBuilder MapShopEndpoints (this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/shop").WithTags("Shop");

        group.MapGet("/products", async (IShopService shop, string? search, string? orderby, string? direction, int? limit, int? offset) =>
        {
            var productsTask = shop.GetProducts(search, orderby, direction, limit, offset);
            var categoriesTask = shop.GetCategories();

            await Task.WhenAll(categoriesTask, productsTask);

            var products = await productsTask;
            var categories = await categoriesTask;

            return Results.Ok(new { products = products.Data, totalProducts = products.TotalRows, categories = categories});
        })
        .Produces<PaginatedRecord<ShopProduct>>(200)
        .WithSummary("Get All Products")
        .WithDescription("Get a list of all items available on the shop");

        group.MapGet("/product/{id}", async (string id, IShopService shop) =>
        {
            try
            {
                var item = await shop.GetItem(id);
                return Results.Ok(item);
                
            } catch (InvalidOperationException)
            {
                return Results.NotFound("Item Not Found");
            }
        })
        .Produces<ShopProduct>(200)
        .WithSummary("Get a Specific Product")
        .WithDescription("Get a specific Item using the Item ID");

        group.MapGet("/orders", async (IShopService shop, HttpContext ctx, string? search, int? limit, int? offset, string? orderby, string? direction, bool? adminMode) =>
        {
            var orders = await shop.GetOrders(ctx, search, limit, offset, orderby, direction, adminMode);
            return Results.Ok(new {orders = orders.Data, totalRows = orders.TotalRows});
        })
        .Produces<PaginatedRecord<Order>>(200)
        .RequireAuthorization()
        .WithSummary("Get All Orders")
        .WithDescription("Get a list of all Orders");

        group.MapGet("/order/{id}", async ( HttpContext ctx, int id, IShopService shop) =>
        {
            var userId = ctx.User.FindFirst("SteamID")?.Value ?? throw new UnauthorizedAccessException("There isn't a SteamId associated with your account!");
            var userAdmin = ctx.User.FindFirst("adminlevel")?.Value ?? "0";
            var isAdmin = int.TryParse(userAdmin, out var level) && level >= 4;
            try
            {
                var order = await shop.GetOrder(id, isAdmin, userId);
                return Results.Ok(order);
                
            } catch (InvalidOperationException)
            {
                return Results.NotFound("Order Not Found");
            }
        })
        .Produces<OrderLong>(200)
        .RequireAuthorization()
        .WithSummary("Get a Specific Order")
        .WithDescription("Get a specific Item using the Order Id");

        group.MapGet("/productCategories", async (IShopService shop) =>
        {
            var categories = await shop.GetCategories();
            return Results.Ok(new { categories = categories});
        })
        .Produces<ShopCategory>(200)
        .WithSummary("Get All Product Categories")
        .WithDescription("Get a list of all Product Categories");

        group.MapPost("/product/{id}/update", async (string id, [FromBody] ShopProduct product, IShopService shop) =>
        {
            try
            {
                if (product.Id <= 0)
                {
                    var name = await shop.CreateItem(product);
                    return Results.Ok(new { name = name});
                } 
                else
                {
                    var name = await shop.UpdateItem(product.Id, product);
                    return Results.Ok(new { name = name});
                }
                
            } catch (InvalidOperationException error)
            {
                return Results.NotFound(new { message = error.Message });
            }
        })
        .Produces(200)
        .RequireAuthorization("SeniorStaff")
        .WithSummary("Update a Product")
        .WithDescription("Update an existing product in the shop");

        group.MapPost("/product/{id}/toggleActive", async (int id, IShopService shop) =>
        {
            try
            {
                var isActive = await shop.ToggleActive(id, "products");
                return Results.Ok(new { isActive = isActive});
            } catch (InvalidOperationException error)
            {
                return Results.NotFound(new { message = error.Message });
            }
        })
        .Produces(200)
        .RequireAuthorization("SeniorStaff")
        .WithSummary("Toggle Product Active Status")
        .WithDescription("Toggle the active status of a product");

        group.MapPost("/category/{id}/update", async (string id, [FromBody] ShopCategory category, IShopService shop) =>
        {
            Console.WriteLine("Why is this not working");
            try
            {
                Console.WriteLine("Starting Update");
                if (category.Id <= 0)
                {
                    Console.WriteLine("Creating Category");
                    var name = await shop.CreateCategory(category);
                    return Results.Ok(new { name = name});
                } 
                else
                {
                    Console.WriteLine("Updating Category");
                    var name = await shop.UpdateCategory(category.Id, category);
                    return Results.Ok(new { name = name});
                }
                
            } catch (InvalidOperationException error)
            {
                return Results.NotFound(new { message = error.Message });
            }
        })
        .Produces(200)
        .RequireAuthorization("SeniorStaff")
        .WithSummary("Update a Category")
        .WithDescription("Update an existing category in the shop");

        group.MapPost("/category/{id}/toggleActive", async (int id, IShopService shop) =>
        {
            try
            {
                var isActive = await shop.ToggleActive(id, "productCategories");
                return Results.Ok(new { isActive = isActive});
            } catch (InvalidOperationException error)
            {
                return Results.NotFound(new { message = error.Message });
            }
        })
        .Produces(200)
        .RequireAuthorization("SeniorStaff")
        .WithSummary("Toggle Category Active Status")
        .WithDescription("Toggle the active status of a category");

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

            return Results.Ok(result);
        })
        .Produces<CheckoutSessionStatusResponse>(200);

        return app;
    }
}