using DecsPage.Constants;
using DecsPage.Models;
using System.Collections.Generic;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Stripe;
using Stripe.Checkout;
using Microsoft.Data.SqlClient;
using System.Text.Json;
using Stripe.V2;

namespace DecsPage.Services;

public interface IShopService
{
    Task<PaginatedRecord<ShopProduct>> GetProducts(string? search, string? orderby, string? direction, int? limit, int? offset);
    Task <ShopProduct> GetItem(string id);
    Task <List<ShopCategory>> GetCategories();
    Task<string> UpdateItem(int id, ShopProduct product);
    Task<string> CreateItem(ShopProduct product);
    Task<string> UpdateCategory(int id, ShopCategory category);
    Task<string> CreateCategory(ShopCategory category);
    Task<string> ToggleActive(int id , string type);
    Task<CreateCheckoutSessionResponse> CreateCheckoutSessionAsync (CreateCheckoutSessionRequest request,CancellationToken cancellationToken);
    Task<CheckoutSessionStatusResponse> GetSessionStatusAsync(string sessionId,CancellationToken cancellationToken);
    Task<PaginatedRecord<Order>>GetOrders(HttpContext ctx,  string? search, int? limit, int? offset, string? orderby, string? direction, bool? adminMode);
    Task<OrderLong>GetOrder(int id, Boolean isAdmin, string? userId);
}

public class ShopService : IShopService
{
        public readonly string stripe_key;
        public readonly string connectionString;
        private readonly string _domain;
        public readonly IJobService _jobs;
    public ShopService (IConfiguration config, IWebHostEnvironment env, IJobService job)
    {
        stripe_key = config["Stripe:Secret"]
        ?? throw new InvalidOperationException("Missing Stripe Key");
        connectionString = config.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Missing Default Connection");
        _domain = config["Frontend:BaseUrl"] ?? "https://decspage.com";
        _jobs = job;
    }
    public async Task<PaginatedRecord<ShopProduct>> GetProducts(string? search, string? orderby, string? direction, int? limit, int? offset)
    {
        int totalRows = 0;
        var result = new List<ShopProduct>();
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();

            var sql = "Select Id, NameId, CategoryId, Name, Description, PricePence, Currency, FulfilmentMode, isActive, sortOrder, ParamsJson, CreatedAt, UpdatedAt,  COUNT(case isActive when 1 then 1 else null end) OVER() AS TotalRows From products WHERE 1=1";
            if (!string.IsNullOrWhiteSpace(search))
            {
                sql += @" AND Name LIKE '%' + @search + '%' OR Description LIKE '%' + @search + '%' OR CAST(PricePence / 100.0 AS DECIMAL(10,2)) = TRY_CAST(@search AS DECIMAL(10,2))";
            };
            var safeOrderBy = (orderby ?? "sortOrder").ToLower() switch
            {
                "id" => "id",
                "price" => "PricePence",
                "duration" => "duration",
                "sortorder" => "sortOrder",
                _ => "sortOrder"
            };

            var safeDirection = (direction ?? "ASC").ToUpper() switch
            {
                "ASC" => "ASC",
                "DESC" => "DESC",
                _ => "DESC"
            };
            
            if (limit.HasValue || offset.HasValue)
            {
                sql += $" ORDER BY CategoryId DESC,{safeOrderBy} {safeDirection} OFFSET @offset ROWS";
                if (limit.HasValue)
                {
                    sql += " FETCH NEXT @limit ROWS ONLY";
                }
            };
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@search", search ?? "");
            command.Parameters.AddWithValue("@limit", limit ?? 0);
            command.Parameters.AddWithValue("@offset", offset ?? 0);
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                if (totalRows == 0)
                {
                    totalRows = reader.GetInt32(reader.GetOrdinal("TotalRows"));
                }
                
                var paramsJson = reader["ParamsJson"].ToString() ?? "{}";

                var sortedParams = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(paramsJson) ?? new();
                var row = new ShopProduct
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    NameId = reader["NameId"].ToString() ?? string.Empty,
                    CategoryId = reader["CategoryId"].ToString() ?? string.Empty,
                    Name = reader["Name"].ToString() ?? string.Empty,
                    Description = reader["Description"].ToString() ?? string.Empty,
                    PricePence = reader.GetInt32(reader.GetOrdinal("PricePence")),
                    Currency = reader["Currency"].ToString() ?? string.Empty,
                    FulfilmentMode = reader["FulfilmentMode"].ToString() ?? string.Empty,
                    IsActive = reader.GetBoolean(reader.GetOrdinal("isActive")),
                    SortingOrder = reader.GetInt32(reader.GetOrdinal("sortOrder")),
                    ParamsJson = sortedParams,
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    UpdatedAt = reader.GetDateTime(reader.GetOrdinal("UpdatedAt"))
                };
                result.Add(row);
            };
        };
        var response = new PaginatedRecord<ShopProduct>(
            totalRows,
            result
        );
        return response;
    }
    public async Task <ShopProduct> GetItem(string id)
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"Select Id, NAmeId, CategoryId, Name, Description, PricePence, Currency, FulfilmentMode, IsActive, SortOrder, ParamsJson, CreatedAt, UpdatedAt FROM products where nameId = @id";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", id);  
            var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                throw new InvalidDataException("Item not found!");
            }
            var paramsJson = reader["ParamsJson"].ToString() ?? "{}";
            var sortedParams = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(paramsJson) ?? new();
            return new ShopProduct
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                NameId = reader["Id"].ToString() ?? string.Empty,
                CategoryId = reader["CategoryId"].ToString() ?? string.Empty,
                Name = reader["Name"].ToString() ?? string.Empty,
                Description = reader["Description"].ToString() ?? string.Empty,
                PricePence = reader.GetInt32(reader.GetOrdinal("PricePence")),
                Currency = reader["Currency"].ToString() ?? string.Empty,
                FulfilmentMode = reader["FulfilmentMode"].ToString() ?? string.Empty,
                IsActive = reader.GetBoolean(reader.GetOrdinal("isActive")),
                SortingOrder = reader.GetInt32(reader.GetOrdinal("sortOrder")),
                ParamsJson = sortedParams,
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                UpdatedAt = reader.GetDateTime(reader.GetOrdinal("UpdatedAt"))
            }; 
        };
    }

    public async Task<string> UpdateItem(int id, ShopProduct product)
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"UPDATE products SET NameId = @NameId, CategoryId = @Category, Name = @Name, Description = @Description, PricePence = @PricePence, Currency = @Currency, FulfilmentMode = @FulfilmentMode, IsActive = @IsActive, SortOrder = @SortOrder, ParamsJson = @ParamsJson, UpdatedAt = GETUTCDATE() WHERE Id = @id";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", id);
            command.Parameters.AddWithValue("@NameId", product.NameId);
            command.Parameters.AddWithValue("@Category", product.CategoryId);
            command.Parameters.AddWithValue("@Name", product.Name);
            command.Parameters.AddWithValue("@Description", product.Description);
            command.Parameters.AddWithValue("@PricePence", product.PricePence);
            command.Parameters.AddWithValue("@Currency", product.Currency);
            command.Parameters.AddWithValue("@FulfilmentMode", product.FulfilmentMode);
            command.Parameters.AddWithValue("@IsActive", product.IsActive);
            command.Parameters.AddWithValue("@SortOrder", product.SortingOrder);
            command.Parameters.AddWithValue("@ParamsJson", JsonSerializer.Serialize(product.ParamsJson));
            var rows = await command.ExecuteNonQueryAsync();

            if (rows == 0) throw new InvalidOperationException("Order update failed.");

            return product.Name;
        }
    }

    public async Task<string> CreateItem(ShopProduct product)
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"
            INSERT INTO products (NameId, CategoryId, Name, Description, PricePence, Currency, FulfilmentMode, IsActive, SortOrder, ParamsJson, CreatedAt, UpdatedAt) 
            OUTPUT INSERTED.Name VALUES 
            (@NameId, @Category, @Name, @Description, @PricePence, @Currency, @FulfilmentMode, @IsActive, @SortOrder, @ParamsJson, GETUTCDATE(), GETUTCDATE())";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@NameId", product.NameId);
            command.Parameters.AddWithValue("@Category", product.CategoryId);
            command.Parameters.AddWithValue("@Name", product.Name);
            command.Parameters.AddWithValue("@Description", product.Description);
            command.Parameters.AddWithValue("@PricePence", product.PricePence);
            command.Parameters.AddWithValue("@Currency", product.Currency);
            command.Parameters.AddWithValue("@FulfilmentMode", product.FulfilmentMode);
            command.Parameters.AddWithValue("@IsActive", product.IsActive);
            command.Parameters.AddWithValue("@SortOrder", product.SortingOrder);
            command.Parameters.AddWithValue("@ParamsJson", JsonSerializer.Serialize(product.ParamsJson));
            var Name = await command.ExecuteScalarAsync();
            return Name?.ToString() ?? string.Empty;
        }
    }

        public async Task<string> UpdateCategory(int id, ShopCategory category)
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"UPDATE productCategories SET NameId = @NameId, Name = @Name, Description = @Description, SortOrder = @SortOrder, IsActive = @IsActive WHERE Id = @id";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", id);
            command.Parameters.AddWithValue("@NameId", category.NameId);
            command.Parameters.AddWithValue("@Name", category.Name);
            command.Parameters.AddWithValue("@Description", category.Description);
            command.Parameters.AddWithValue("@SortOrder", category.SortingOrder);
            command.Parameters.AddWithValue("@IsActive", category.IsActive);
            var rows = await command.ExecuteNonQueryAsync();

            if (rows == 0) throw new InvalidOperationException("Category update failed.");

            return category.Name;
        }
    }

    public async Task<string> CreateCategory(ShopCategory category)
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"
            INSERT INTO productCategories (NameId, Name, Description, SortOrder, IsActive, CreatedAt) 
            OUTPUT INSERTED.Name VALUES 
            (@NameId, @Name, @Description, @SortOrder, @IsActive, GETUTCDATE())";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@NameId", category.NameId);
            command.Parameters.AddWithValue("@Name", category.Name);
            command.Parameters.AddWithValue("@Description", category.Description);
            command.Parameters.AddWithValue("@SortOrder", category.SortingOrder);
            command.Parameters.AddWithValue("@IsActive", category.IsActive);
            var Name = await command.ExecuteScalarAsync();
            return Name?.ToString() ?? string.Empty;
        }
    }


    public async Task<string> ToggleActive(int id, string type)
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = $"UPDATE ${type} SET IsActive = CASE WHEN IsActive = 1 THEN 0 ELSE 1 END OUTPUT INSERTED.IsActive WHERE Id = @id";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", id);
            var isActive = await command.ExecuteScalarAsync();
            return isActive?.ToString() ?? string.Empty;
        };
    }

    public async Task <List<ShopCategory>> GetCategories()
    {
        var result = new List<ShopCategory>();
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"Select Id, NameId, Name, Description, SortORder, isActive, CreatedAt FROM productCategories ORDER BY SortOrder ASC";
            using var command = new SqlCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var row = new ShopCategory(
                    Id: reader.GetInt32(reader.GetOrdinal("Id")),
                    NameId: reader["NameId"].ToString() ?? string.Empty,
                    Name: reader["Name"].ToString() ?? string.Empty,
                    Description: reader["Description"].ToString() ?? string.Empty,
                    SortingOrder: reader.GetInt32(reader.GetOrdinal("sortOrder")),
                    IsActive: reader.GetBoolean(reader.GetOrdinal("isActive")),
                    CreatedAt: reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
                );   
                result.Add(row);
            }
            return result;
        };
    }

    public async Task<CreateCheckoutSessionResponse> CreateCheckoutSessionAsync (CreateCheckoutSessionRequest request,CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.ReceiverId)) throw new InvalidDataException("Missing SteamId, Make sure you are logged in!"); 

        var lineItemsOptions = new List<SessionLineItemOptions>();
        var totalPence = 0;

        foreach (var item in request.Basket)
        {
            var product = await GetItem(item.NameId);

            if (item.PricePence != product.PricePence) throw new InvalidDataException("Price mismatch on " + product.Name);
            if (item.Quantity <= 0) continue;

            totalPence += product.PricePence * (item.Quantity ?? 0);
            
            lineItemsOptions.Add(new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        UnitAmount = product.PricePence,
                        Currency = "gbp",
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = product.Name,
                            Description = product.Description
                        },
                    },
                    Quantity = item.Quantity,
                }
            );
        }

        if (lineItemsOptions.Count == 0) throw new InvalidDataException("Basket is empty.");

        var domain = _domain;

        var options = new SessionCreateOptions
        {
            LineItems = lineItemsOptions,
            UiMode = "embedded_page",
            Mode = "payment",
            ReturnUrl = $"{domain}/return?session_id={{CHECKOUT_SESSION_ID}}",
            // Metadata = new Dictionary<string, string> 
            // {
            // }
        };
        var client = new StripeClient(stripe_key);
        Session session = client.V1.Checkout.Sessions.Create(options);
        var basketJson = JsonSerializer.Serialize(request.Basket);
        var orderId = await InsertNewOrder(request.PurchaserId, request.ReceiverId, basketJson, totalPence, "gbp", session.Id);

        if (string.IsNullOrWhiteSpace(session.ClientSecret))
            throw new InvalidOperationException("Failed to create checkout session.");

        return new CreateCheckoutSessionResponse(session.ClientSecret);
    }

    public async Task<CheckoutSessionStatusResponse> GetSessionStatusAsync(string sessionId,CancellationToken cancellationToken)
    {
        var client = new StripeClient(stripe_key);

        Session session = client.V1.Checkout.Sessions.Get(sessionId);

        var orderDetails = await UpdateOrder(session);

        var jobId = 0;

        var basket = JsonSerializer.Deserialize<List<ShopProduct>>(orderDetails.BasketJson);

        if (session.Status == "complete" && session.PaymentStatus == "paid")
        {   
            var jobPayload = new Dictionary<string, object>
            {
                ["orderId"] = orderDetails.OrderId.ToString()
            };

            if (basket!.Any(p => p.FulfilmentMode.Contains("Manual")))
            {
                jobPayload["manual"] = "Incomplete";
            }

            jobId = await _jobs.CreateJobAsync("orderFulfilment", jobPayload);
        }


        return new CheckoutSessionStatusResponse(
            Status: session.Status,
            PaymentStatus: session.PaymentStatus,
            Data: session.Metadata,
            OrderId: orderDetails.OrderId,
            Basket: basket,
            JobId: jobId
        );
    }

    public async Task<int> InsertNewOrder(string purchaser, string receiver, string basket, int totalPence, string currency, string sessionId)
    {
        using var connection = new SqlConnection(connectionString);
        {
            await connection.OpenAsync();
            var sql =   @"INSERT INTO Orders (PurchaserId, ReceiverId, BasketJson, Status, PaymentStatus, AmountPence, Currency, StripeCheckoutSessionId, CreatedAt, UpdatedAt) 
                        OUTPUT INSERTED.id VALUES
                        (@PurchaserId, @ReceiverId, @BasketJson, 'incomplete', 'unpaid', @AmountPence, @Currency, @SessionId, GETUTCDATE(), GETUTCDATE())";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@PurchaserId", purchaser);
            command.Parameters.AddWithValue("@ReceiverId", receiver);
            command.Parameters.AddWithValue("@BasketJson", basket);
            command.Parameters.AddWithValue("@AmountPence", totalPence);
            command.Parameters.AddWithValue("@Currency", currency);
            command.Parameters.AddWithValue("@SessionId", sessionId);

            var id = Convert.ToInt32(await command.ExecuteScalarAsync());

            return id;
        }
    }

    public async Task<UpdateOrderResult> UpdateOrder(Session session)
    {
        using var connection = new SqlConnection(connectionString);
        {
            await connection.OpenAsync();
            var sql =   @"UPDATE orders SET 
                        status = @status, PaymentStatus = @paymentStatus, StripePaymentIntentId = @PaymentId, PaymentMethod = @paymentMethod, UpdatedAt = GETUTCDATE() 
                        OUTPUT INSERTED.Id, INSERTED.BasketJson
                        WHERE StripeCheckoutSessionId = @sessionId";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@status", session.Status);
            command.Parameters.AddWithValue("@paymentStatus", session.PaymentStatus);
            command.Parameters.AddWithValue("@PaymentId", (object?)session.PaymentIntentId ?? DBNull.Value);
            command.Parameters.AddWithValue("@paymentMethod", "Card");
            command.Parameters.AddWithValue("@sessionId", session.Id);  

            using var reader = await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync()) throw new InvalidOperationException("Order update failed.");

            var orderId = Convert.ToInt32(reader["Id"]);
            var basketJson = reader["BasketJson"].ToString() ?? "[]";

            return new UpdateOrderResult(orderId, basketJson);
        }
    }

    public async Task<PaginatedRecord<Order>>GetOrders(HttpContext ctx, string? search, int? limit, int? offset, string? orderby, string? direction, bool? adminMode)
    {
        var userId = ctx.User.FindFirst("SteamID")?.Value ?? throw new UnauthorizedAccessException("There isn't a SteamId associated with your account!");
        var userAdmin = ctx.User.FindFirst("adminlevel")?.Value ?? "0";
        var isAdmin = int.TryParse(userAdmin, out var level) && level >= 4;
        var totalRows = 0;
        var result = new List<Order>();
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"Select id, PurchaserId, ReceiverId, BasketJson, Status, PaymentStatus, AmountPence, Currency, CreatedAt, UpdatedAt, COUNT(*) OVER() AS TotalRows FROM orders WHERE id>40 ";
            if (!(adminMode ?? false) || !isAdmin)
            {
                sql += "AND PurchaserId = @steamid AND Status != 'incomplete'";
            }
            if (!string.IsNullOrWhiteSpace(search))
            {
                sql += @"
                    AND (
                        id LIKE '%' + @search + '%'
                        OR BasketJson LIKE '%' + @search + '%'
                        OR Status LIKE '%' + @search + '%'
                        OR AmountPence LIKE '%' + @search + '%'
                    )
                ";
            };
            var safeOrderBy = (orderby ?? "id").ToLower() switch
            {
                "id" => "id",
                "status" => "Status",
                "price" => "AmountPence",
                _ => "id"
            };

            var safeDirection = (direction ?? "ASC").ToUpper() switch
            {
                "ASC" => "ASC",
                "DESC" => "DESC",
                _ => "ASC"
            };
           sql += $" ORDER BY {safeOrderBy} {safeDirection} ";
            if (limit.HasValue || offset.HasValue)
            {
                sql += " OFFSET @offset ROWS";
                if (limit.HasValue)
                {
                    sql += " FETCH NEXT @limit ROWS ONLY";
                }
            };
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@offset", offset ?? 0);
            command.Parameters.AddWithValue("@limit", limit ?? 0);
            command.Parameters.AddWithValue("@search", search ?? "");
            command.Parameters.AddWithValue("@steamid", userId);
            var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                if (totalRows == 0)
                {
                    totalRows = reader.GetInt32(reader.GetOrdinal("TotalRows"));
                }
                var basketJson = reader["BasketJson"].ToString() ?? "{}";

                var basket = JsonSerializer.Deserialize<List<ShopProduct>>(basketJson) ?? new();
                
                var row = new Order (
                    Id: Convert.ToInt32(reader["Id"]),
                    PurchaserId: reader["PurchaserId"].ToString() ?? string.Empty,
                    ReceiverId: reader["ReceiverId"].ToString() ?? string.Empty,
                    Basket: basket,
                    Status: reader["Status"].ToString() ?? string.Empty,
                    PaymentStatus: reader["PaymentStatus"].ToString() ?? string.Empty,
                    AmountPence: Convert.ToInt32(reader["AmountPence"]),
                    Currency: reader["Currency"].ToString() ?? string.Empty,
                    CreatedAt: reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    UpdatedAt: reader.GetDateTime(reader.GetOrdinal("UpdatedAt"))
                );
                result.Add(row);
            };
        }
        var response = new PaginatedRecord<Order>(
            totalRows,
            result
        );
        return response;
    }

    public async Task<OrderLong>GetOrder(int id, Boolean isAdmin, string? userId)
    {

        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"Select TOP 1 o.id, o.PurchaserId, o.ReceiverId, o.BasketJson, o.Status, o.PaymentStatus, o.PaymentMethod, o.StripeCheckoutSessionId, o.StripePaymentIntentId, o.AmountPence, o.Currency, o.CreatedAt, o.UpdatedAt,
                        j.id AS jobId, j.type, j.status AS jobStatus, j.payload, j.result, j.created_at, j.updated_at, j.priority  
                        FROM orders o 
                        LEFT JOIN Jobs j
                        ON TRY_CONVERT(INT, JSON_VALUE(j.Payload, '$.orderId')) = o.Id WHERE o.id = @id";
            if (!isAdmin)
            {
                sql += " AND PurchaserId = @steamid";
            }
            sql += " ORDER BY j.created_at DESC";
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@id", id);
            command.Parameters.AddWithValue("@steamid", userId ?? "");
            var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                throw new InvalidDataException("Order not found!");
            }
            var basketJson = reader["BasketJson"].ToString() ?? "{}";

            var basket = JsonSerializer.Deserialize<List<ShopProduct>>(basketJson) ?? new();
            return new OrderLong (
                Id: Convert.ToInt32(reader["Id"]),
                PurchaserId: reader["PurchaserId"].ToString() ?? string.Empty,
                ReceiverId: reader["ReceiverId"].ToString() ?? string.Empty,
                Basket: basket,
                Status: reader["Status"].ToString() ?? string.Empty,
                PaymentStatus: reader["PaymentStatus"].ToString() ?? string.Empty,
                PaymentMethod: reader["PaymentMethod"].ToString() ?? string.Empty,
                StripeCheckoutSessionId: reader["StripeCheckoutSessionId"].ToString() ?? string.Empty,
                StripePaymentIntentId: reader["StripePaymentIntentId"].ToString() ?? string.Empty,
                AmountPence: Convert.ToInt32(reader["AmountPence"]),
                Currency: reader["Currency"].ToString() ?? string.Empty,
                CreatedAt: reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                UpdatedAt: reader.GetDateTime(reader.GetOrdinal("UpdatedAt")),
                Job: reader["jobId"] == DBNull.Value
                    ? null!
                    : new Job(
                        Convert.ToInt32(reader["jobId"]),
                        reader["type"].ToString() ?? string.Empty,
                        reader["jobStatus"].ToString() ?? string.Empty,
                        reader["result"].ToString() ?? string.Empty,
                        reader["payload"].ToString() ?? "{}",
                        Convert.ToBoolean(reader["priority"] ?? false),
                        reader.GetDateTime(reader.GetOrdinal("created_at")),
                        reader.GetDateTime(reader.GetOrdinal("updated_at"))
                    )
            );
        };
    }
    
    
}