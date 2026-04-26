using DecsPage.Models;
using DecsPage.Services;

namespace DecsPage.Endpoints;

public static class ShopEndpoints
{
    public static IEndpointRouteBuilder MapShopEndpoints (this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/shop").WithTags("Shop");

        group.MapGet("/products", async (IShopService shop, string search, string orderby, string direction) =>
        {
            var products = await shop.GetProducts(search, orderby, direction);
            var productsList = products.Values.ToList();
            return Results.Ok(new {products = productsList, totalProducts = products.Count()});
        })
        .WithSummary("Get All Products")
        .WithDescription("Get a list of all items available on the shop");

        group.MapGet("/item", async (string id, IShopService shop) =>
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
        .WithSummary("Get a Specific Item")
        .WithDescription("Get a specific Item using the Item ID");

        return app;
    }
}