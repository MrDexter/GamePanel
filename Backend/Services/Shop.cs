using DecsPage.Constants;
using DecsPage.Models;

namespace DecsPage.Services;

public interface IShopService
{
    Task<Dictionary<string, ShopCategory>> GetProducts(string search, string orderby, string direction);
    ShopProduct GetItem(string id);
}

public class ShopService : IShopService
{
    public  ShopService ()
    {  
        
    }
    public async Task<Dictionary<string, ShopCategory>> GetProducts(string search, string orderby, string direction)
    {
        var products = ShopProducts.Products;
        // .SelectMany(c => c.Value.Products);
        // if (!string.IsNullOrEmpty(search))
        // {
        //     products = products.Where(p =>
        //         p.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
        //         p.Description.Contains(search, StringComparison.OrdinalIgnoreCase)
        //     );
        // }
        // products = orderby?.ToLower() switch
        // {
        //     "name" => direction == "desc"
        //         ? products.OrderByDescending(p => p.Name)
        //         : products.OrderBy(p => p.Name),

        //     "price" => direction == "desc"
        //         ? products.OrderByDescending(p => p.PricePence)
        //         : products.OrderBy(p => p.PricePence),

        //     "duration" => direction == "desc"
        //         ? products.OrderByDescending(p => p.DurationDays)
        //         : products.OrderBy(p => p.DurationDays),

        //     _ => products
        // };
        return products;
    }
    public ShopProduct GetItem(string id)
    {
        var product = ShopProducts.Products
            .SelectMany(c => c.Value.Products)
            .FirstOrDefault(p => p.Id == id);

        if (product is null)
            throw new InvalidOperationException("Product not found");

        return product;
    }
    
}