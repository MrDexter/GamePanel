using DecsPage.Models;
namespace DecsPage.Constants;

public static class ShopProducts
{
    public static readonly Dictionary<string, ShopCategory> Products = new()
    {
        ["membership"] = new ShopCategory(
            Name: "Membership",
            Products: new List<ShopProduct>
            {
                new ShopProduct
                {
                    Id = "thirtyDays",
                    Name = "30 Day Membership",
                    PricePence = 1000,
                    Description = "Purchase Donator Membership for 30 days",
                    DonatorLevel = 1,
                    DurationDays = 30
                },
                new ShopProduct
                {
                    Id = "sixMonths",
                    Name = "6 Month Membership",
                    PricePence = 5000,
                    Description = "Purchase Donator Membership for 6 months",
                    DonatorLevel = 1,
                    DurationDays = 180
                },
                new ShopProduct
                {
                    Id= "oneYear",
                    Name = "1 Year Membership",
                    PricePence = 9000,
                    Description = "Purchase Donator Membership for 1 year",
                    DonatorLevel = 1,
                    DurationDays = 365
                }
            }
        ),
        ["IngameItems"] = new ShopCategory(
            Name: "Ingame Items",
            Products: new List<ShopProduct>
            {
                new ShopProduct
                {
                    Id = "Airdrop",
                    Name = "Airdrop",
                    PricePence = 2500,
                    Description = "Ability to Call in 1 Airdrop"
                }
            }
        )
    };
}