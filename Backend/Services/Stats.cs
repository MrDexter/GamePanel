using Microsoft.Data.SqlClient;
using DecsPage.Models;

namespace DecsPage.Services;

public interface IStatsService
{
    Task <DashboardPlayerStats> GetPlayerStats();
    Task <DashboardGroupStats> GetGroupStats();
    Task <DashboardUserStats> GetUserStats();
    Task <DashboardJobStats> GetJobStats();
    Task<DashboardVehicleStats> GetVehicleStats();
    Task<DashboardHousingStats> GetHousingStats();
    Task<DashboardTopStats> GetTopStats();
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
                COUNT(*) AS Total,
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
                SUM(CASE WHEN irulevel > 0 THEN 1 ELSE 0 END) AS IonAcad,
                SUM(CAST(bankacc AS BIGINT)) AS TotalBank
                FROM players";
            using var command = new SqlCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new DashboardPlayerStats
                {
                    Total = reader["Total"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Total"]),
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
                    IonAcad = reader["ionAcad"] == DBNull.Value ? 0 : Convert.ToInt32(reader["ionAcad"]),
                    TotalBank = reader["totalBank"] == DBNull.Value ? 0 : Convert.ToInt64(reader["totalBank"])
                };
            }
            throw new InvalidOperationException("Failed to Retrieve Player Stats");
            
        }
    }

    public async Task<DashboardGroupStats> GetGroupStats()
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"SELECT
                COUNT(*) AS Total,
                SUM(CASE WHEN alive = 1 THEN 1 ELSE 0 END) AS Active,
                SUM(CASE WHEN alive = 0 THEN 1 ELSE 0 END) AS Inactive,
                SUM(CAST(bank AS BIGINT)) AS TotalBank
                FROM organisations";
            using var command = new SqlCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new DashboardGroupStats
                {
                    Total = reader["Total"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Total"]),
                    Active = reader["Active"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Active"]),
                    Inactive = reader["Inactive"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Inactive"]),
                    TotalBank = reader["TotalBank"] == DBNull.Value ? 0 : Convert.ToInt64(reader["TotalBank"])
                };
            }
            throw new InvalidOperationException("Failed to Retrieve Group Stats");
        };
    }

    public async Task<DashboardUserStats> GetUserStats()
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"SELECT
                COUNT(*) AS Total,
                SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) AS Active,
                SUM(CASE WHEN isActive = 0 THEN 1 ELSE 0 END) AS Inactive
                FROM users";
            using var command = new SqlCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new DashboardUserStats
                {
                    Total = reader["Total"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Total"]),
                    Active = reader["Active"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Active"]),
                    Inactive = reader["Inactive"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Inactive"]),
                };
            }
            throw new InvalidOperationException("Failed to Retrieve User Stats");
        }
    }

    public async Task<DashboardJobStats> GetJobStats()
    {        
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"SELECT
                COUNT(*) AS Total,
                SUM(CASE WHEN status = 'Complete' THEN 1 ELSE 0 END) AS Complete,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS Pending,
                SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) AS Failed,
                SUM(CASE WHEN status = 'Processing' THEN 1 ELSE 0 END) AS Processing,
                SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS Cancelled
                FROM jobs";
            using var command = new SqlCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new DashboardJobStats
                {
                    Total = reader["Total"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Total"]),
                    Complete = reader["Complete"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Complete"]),
                    Pending = reader["Pending"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Pending"]),
                    Failed = reader["Failed"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Failed"]),
                    Processing = reader["Processing"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Processing"]),
                    Cancelled = reader["Cancelled"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Cancelled"]),
                };
            }
            throw new InvalidOperationException("Failed to Retrieve Job Stats");
        }
    }

    public async Task<DashboardVehicleStats> GetVehicleStats()
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"SELECT
                COUNT(*) AS Total,
                SUM(CASE WHEN side = 'civ' THEN 1 ELSE 0 END) AS Civilian,
                SUM(CASE WHEN side = 'syn' THEN 1 ELSE 0 END) AS Ion,
                SUM(CASE WHEN type = 'car' THEN 1 ELSE 0 END) AS Car,
                SUM(CASE WHEN type = 'air' THEN 1 ELSE 0 END) AS Air,
                SUM(CASE WHEN impounded = 1 THEN 1 ELSE 0 END) AS Impounded
                FROM vehicles";
            using var command = new SqlCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new DashboardVehicleStats
                {
                    Total = reader["Total"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Total"]),
                    Civilian = reader["Civilian"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Civilian"]),
                    Ion = reader["Ion"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Ion"]),
                    Car = reader["Car"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Car"]),
                    Air = reader["Air"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Air"]),
                    Impounded = reader["Impounded"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Impounded"])
                };
            }
            throw new InvalidOperationException("Failed to Retrieve Vehicle Stats");
        }
    }

    public async Task<DashboardHousingStats> GetHousingStats()
    {
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();
            var sql = @"SELECT
                COUNT(*) AS Total,
                SUM(CASE WHEN isOrgHouse = 0 THEN 1 ELSE 0 END) AS Civilian,
                SUM(CASE WHEN isOrgHouse = 1 THEN 1 ELSE 0 END) AS Organisations,
                SUM(CASE WHEN creditBank != null THEN 1 ELSE 0 END) AS Mortgage
                FROM housing";
            using var command = new SqlCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new DashboardHousingStats
                {
                    Total = reader["Total"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Total"]),
                    Civilian = reader["Civilian"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Civilian"]),
                    Group = reader["Organisations"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Organisations"]),
                    Mortgage = reader["Mortgage"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Mortgage"])
                };
            }
            throw new InvalidOperationException("Failed to Retrieve Housing Stats");
        }
    }

    public async Task<DashboardTopStats> GetTopStats()
    {
        using (var connection = new SqlConnection(connectionString))
        {
            var topAssets = new DashbaordTopAssets{};
            var topMoney = new DashboardTopMoney{};
            var topPlaytime = new DashboardTopPlaytime{};
            await connection.OpenAsync();
            var sql = @"
                WITH HouseCounts AS (
                    SELECT
                        ownerpid AS playerid,
                        COUNT(*) AS Houses
                    FROM housing
                    WHERE isOrgHouse = 0
                    GROUP BY ownerpid
                ),
                VehicleCounts AS (
                    SELECT
                        pid AS playerid,
                        SUM(CASE WHEN type = 'Car' THEN 1 ELSE 0 END) AS Ground,
                        SUM(CASE WHEN type = 'air' THEN 1 ELSE 0 END) AS Air,
                        COUNT(*) AS Vehicles
                    FROM vehicles
                    GROUP BY pid
                )
                SELECT TOP 1
                    p.name,
                    p.playerid,
                    ISNULL(h.Houses, 0) AS Houses,
                    ISNULL(v.Vehicles, 0) AS Vehicles,
                    ISNULL(h.Houses, 0) + ISNULL(v.Vehicles, 0) AS TotalAssets,
                    v.Air, v.Ground
                FROM players p
                LEFT JOIN HouseCounts h ON h.playerid = p.playerid
                LEFT JOIN VehicleCounts v ON v.playerid = p.playerid
                ORDER BY TotalAssets DESC;";

            using (var command = new SqlCommand(sql, connection))
            {            
                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    topAssets = new DashbaordTopAssets
                    {
                        Name = reader["name"].ToString() ?? string.Empty,
                        PlayerId = reader["playerid"].ToString() ?? string.Empty,
                        Houses = reader["Houses"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Houses"]),
                        Vehicles = reader["Vehicles"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Vehicles"]),
                        Ground = reader["Ground"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Ground"]),
                        Air = reader["Air"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Air"]),
                        Total = reader["TotalAssets"] == DBNull.Value ? 0 : Convert.ToInt32(reader["TotalAssets"])
                    };
                }
            };
            var sql1 = @"SELECT TOP 1 name, playerid, cash, bankacc,
            (cash + bankacc) AS TotalMoney
            FROM players
            ORDER BY bankacc DESC;";
            using (var command = new SqlCommand(sql1, connection))
            {
                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    topMoney = new DashboardTopMoney
                    {
                        Name = reader["name"].ToString() ?? string.Empty,
                        PlayerId = reader["playerid"].ToString() ?? string.Empty,
                        Bank = reader["bankacc"] == DBNull.Value ? 0 : Convert.ToInt64(reader["bankacc"]),
                        Cash = reader["cash"] == DBNull.Value ? 0 : Convert.ToInt64(reader["cash"]),
                        Total = reader["TotalMoney"] == DBNull.Value ? 0 : Convert.ToInt64(reader["TotalMoney"])
                    };
                }
            };
            var sql2 = @"SELECT TOP 1 name, playerid, 
            playtime_civ AS Civilian, 
            playtime_cop AS Police, 
            playtime_nhs AS Medic,
            playtime_opfor AS Ion,
            (playtime_civ + playtime_cop + playtime_nhs + playtime_opfor) AS TotalPlaytime
            FROM players
            ORDER BY TotalPlaytime DESC;";
            using (var command = new SqlCommand(sql2, connection))
            {
                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    topPlaytime = new DashboardTopPlaytime
                    {
                        Name = reader["name"].ToString() ?? string.Empty,
                        PlayerId = reader["playerid"].ToString() ?? string.Empty,
                        Civilian = reader["Civilian"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Civilian"]),
                        Police = reader["Police"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Police"]),
                        Medic = reader["Medic"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Medic"]),
                        Ion = reader["Ion"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Ion"]),
                        Total = reader["TotalPlaytime"] == DBNull.Value ? 0 : Convert.ToInt32(reader["TotalPlaytime"])
                    };
                }
            };

            return new DashboardTopStats
            {
                Assets = topAssets,
                Money = topMoney,
                Playtime = topPlaytime
            };
            throw new InvalidOperationException("Failed to Retrieve Top Stats");
        }
    }

}