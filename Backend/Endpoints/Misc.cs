using Microsoft.Data.SqlClient;
namespace BackgroundJobs.Endpoints;

public static class MiscEndpoints
{
    public static IEndpointRouteBuilder MapMiscEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/health", async () =>
        {
            return Results.Ok("Ok");   
        });

        app.MapGet("/debug/config", (IConfiguration cfg) =>
        {
            var hasSql = !string.IsNullOrWhiteSpace(cfg.GetConnectionString("DefaultConnection"));
            var hasBlob = !string.IsNullOrWhiteSpace(cfg["Storage:ConnectionString"]);
            var container = cfg["Storage:Container"] ?? "(null)";

            return Results.Ok(new { hasSql, hasBlob, container });
        });

        app.MapGet("/debug/sql", async (IConfiguration cfg) =>
{
            await using var conn = new SqlConnection(cfg.GetConnectionString("DefaultConnection"));
            await conn.OpenAsync();

            await using var cmd = new SqlCommand("SELECT 1", conn);
            var x = (int)await cmd.ExecuteScalarAsync();

            return Results.Ok(new { ok = x == 1 });
        });


        return app;
    }
};