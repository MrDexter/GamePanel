using Microsoft.Data.SqlClient;
using DecsPage.Models;

namespace DecsPage.Services;

public interface IStatsService
{
    Task <DashboardPlayerStats> GetPlayerStats();
}

public class StatsService : IStatsService
{
    private readonly string connectionString;
    private readonly ILogger<LoggingService> _logger;
    public StatsService(IConfiguration config, ILogger<LoggingService> logger)
    {
        connectionString = config.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Missing Default Connection");
        _logger = logger;
    }

    public async Task <DashboardPlayerStats> GetPlayerStats()
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"SELECT
                COUNT(*) AS Players,
                SUM(CASE WHEN coplevel > 0 THEN 1 ELSE 0 END) AS Police,
                SUM(CASE WHEN coplevel > 10 THEN 1 ELSE 0 END) AS PoliceCommand,
                SUM(CASE WHEN tfulevel > 0 THEN 1 ELSE 0 END) AS Tfu,
                SUM(CASE WHEN ncalevel > 0 THEN 1 ELSE 0 END) AS Nca,
                SUM(CASE WHEN mpulevel > 0 THEN 1 ELSE 0 END) AS Mpu,
                SUM(CASE WHEN npaslevel > 0 THEN 1 ELSE 0 END) AS Npas,
                SUM(CASE WHEN acadlevel > 0 THEN 1 ELSE 0 END) AS PolAcad,
                SUM(CASE WHEN mediclevel > 0 THEN 1 ELSE 0 END) AS Medics,
                SUM(CASE WHEN mediclevel > 7 THEN 1 ELSE 0 END) AS MedicsCommand,
                SUM(CASE WHEN hemslevel > 0 THEN 1 ELSE 0 END) AS Hems,
                SUM(CASE WHEN hartlevel > 0 THEN 1 ELSE 0 END) AS Hart,
                SUM(CASE WHEN rplevel > 0 THEN 1 ELSE 0 END) AS MedAcad,
                SUM(CASE WHEN ionlevel > 0 THEN 1 ELSE 0 END) AS Ion,
                SUM(CASE WHEN ionlevel > 6 THEN 1 ELSE 0 END) AS IonCommand,
                SUM(CASE WHEN deltalevel > 0 THEN 1 ELSE 0 END) AS Delta,
                SUM(CASE WHEN umlevel > 0 THEN 1 ELSE 0 END) AS UM,
                SUM(CASE WHEN iaflevel > 0 THEN 1 ELSE 0 END) AS IonAir,
                SUM(CASE WHEN irulevel > 0 THEN 1 ELSE 0 END) AS IonAcad
                FROM players";
            using var command = new SqlCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                return new DashboardPlayerStats
                {
                    Players = reader["players"] == DBNull.Value ? 0 : Convert.ToInt32(reader["players"]),
                    Police = reader["police"] == DBNull.Value ? 0 : Convert.ToInt32(reader["police"]),
                    PoliceCommand = reader["policeCommand"] == DBNull.Value ? 0 : Convert.ToInt32(reader["policeCommand"]),
                    Tfu = reader["tfu"] == DBNull.Value ? 0 : Convert.ToInt32(reader["tfu"]),
                    Nca = reader["nca"] == DBNull.Value ? 0 : Convert.ToInt32(reader["nca"]),
                    Npas = reader["npas"] == DBNull.Value ? 0 : Convert.ToInt32(reader["npas"]),
                    Mpu = reader["mpu"] == DBNull.Value ? 0 : Convert.ToInt32(reader["mpu"]),
                    PolAcad = reader["polAcad"] == DBNull.Value ? 0 : Convert.ToInt32(reader["polAcad"]),
                    Medics = reader["medics"] == DBNull.Value ? 0 : Convert.ToInt32(reader["medics"]),
                    MedicsCommand = reader["medicsCommand"] == DBNull.Value ? 0 : Convert.ToInt32(reader["medicsCommand"]),
                    Hems = reader["hems"] == DBNull.Value ? 0 : Convert.ToInt32(reader["hems"]),
                    Hart = reader["hart"] == DBNull.Value ? 0 : Convert.ToInt32(reader["hart"]),
                    MedAcad = reader["medAcad"] == DBNull.Value ? 0 : Convert.ToInt32(reader["medAcad"]),
                    Ion = reader["ion"] == DBNull.Value ? 0 : Convert.ToInt32(reader["ion"]),
                    IonCommand = reader["ionCommand"] == DBNull.Value ? 0 : Convert.ToInt32(reader["ionCommand"]),
                    Delta = reader["delta"] == DBNull.Value ? 0 : Convert.ToInt32(reader["delta"]),
                    Um = reader["um"] == DBNull.Value ? 0 : Convert.ToInt32(reader["um"]),
                    Iaf = reader["ionAir"] == DBNull.Value ? 0 : Convert.ToInt32(reader["ionAir"]),
                    IonAcad = reader["ionAcad"] == DBNull.Value ? 0 : Convert.ToInt32(reader["ionAcad"])
                };
            }
            throw new InvalidOperationException("Failed to Retrieve Player Stats");
            
        }
    }

}