using Microsoft.Data.SqlClient;
using DecsPage.Models;
using DecsPage.Constants;
using Microsoft.AspNetCore.Mvc;
using Azure.Core;
using System.Transactions;
using System.Text.Json;

namespace DecsPage.Services;


public interface IPlayerService
{
    Task<PaginatedRecord<Player>> GetAllPlayers(int? limit, int? offset);
    Task<List<Dictionary<string, object>>> GetPlayer(string id);
    Task<UpdateRank> UpdateRank(string id, string rank, string newRank);
    Task UpdateWhitelisting(HttpContext ctx, WhitelistUpdateRequest request);
    Task<PaginatedRecord<Player>>SearchPlayersAsync(string search, int? limit, int? offset);
    Task<PlayerPerms>GetPlayerPerms(string id);
}

public class PlayerService : IPlayerService
{
    private readonly string connectionString;

    private readonly ILoggingService _logging;

    public PlayerService(IConfiguration config, ILoggingService logging)
    {
        connectionString = config.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Missing Default Connection");
        _logging = logging; 
    }

    public async Task<PaginatedRecord<Player>> GetAllPlayers(int? limit, int? offset)
    {
        int totalRows = 0;
        var result = new List<Player>();
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();

            var sql = "Select uid, name, playerid, cash, bankacc, adminLevel, copLevel, ionLevel, medicLevel, last_seen, insert_time, COUNT(*) OVER() AS TotalRows From players";
            if (limit.HasValue || offset.HasValue)
            {
                sql += " ORDER BY uid OFFSET @offset ROWS";
                if (limit.HasValue)
                {
                    sql += " FETCH NEXT @limit ROWS ONLY";
                }
            };
            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@limit", limit ?? 0);
            command.Parameters.AddWithValue("@offset", offset ?? 0);
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                if (totalRows == 0)
                {
                    totalRows = reader.GetInt32(reader.GetOrdinal("TotalRows"));
                }
                var row = new Player(
                    reader["uid"].ToString() ?? string.Empty,
                    reader["name"].ToString() ?? string.Empty,
                    reader["playerid"].ToString() ?? string.Empty,
                    reader["cash"].ToString() ?? string.Empty,
                    reader["bankacc"].ToString() ?? string.Empty,
                    reader["adminLevel"].ToString() ?? string.Empty,
                    reader["copLevel"].ToString() ?? string.Empty,
                    reader["ionLevel"].ToString() ?? string.Empty,
                    reader["medicLevel"].ToString() ?? string.Empty,
                    reader.GetDateTime(reader.GetOrdinal("last_seen")),
                    reader.GetDateTime(reader.GetOrdinal("insert_time"))
                );
                result.Add(row);
            };
        };
        var response = new PaginatedRecord<Player>(
            totalRows,
            result
        );
        return response;
    }

    public async Task<List<Dictionary<string, object>>> GetPlayer(string id)
    {
        var result = new List<Dictionary<string, object>>();
        var row = new Dictionary<string, object>();
        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        var sql = "Select uid, name, aliases, playerid, cash, bankacc, adminlevel, donorlevel, coplevel, tfulevel, ncalevel, npaslevel, mpulevel, acadlevel, ionlevel, deltalevel, umlevel, iaflevel, irulevel, mediclevel, hemslevel, hartlevel, rplevel, civ_licenses, insert_time, van_login, cop_login, nhs_login, last_seen, playerXP, donorExpiry, playtime_civ, playtime_cop, playtime_nhs, playtime_cop, playtime_opfor FROM players WHERE CAST(uid AS NVARCHAR) = @uid OR playerid = @uid";
        using (var command = new SqlCommand(sql, connection))
        {
            command.Parameters.AddWithValue("@uid", id);
            using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
                {
                    throw new InvalidDataException("Player Not Found!");
                };
                for (int i=0; i < reader.FieldCount; i++)
                {
                    row[reader.GetName(i)] = reader.GetValue(i);
                };

                //Fix Licenses
                var rawLicenses = reader["civ_licenses"].ToString() ?? string.Empty;
                var clean = rawLicenses.Replace("[[", "").Replace("]]", "").Replace("\"", "");
                var pairs = clean.Split("],[");
                var activeLicenses = new List<string>();
                foreach (var p in pairs)
                {
                    var parts = p.Split(",");
                    if (parts.Length == 2 && parts[1] == "1")
                    {
                        var name = parts[0].Replace("license_civ_", "").Replace("license_med_", "");
                        activeLicenses.Add(char.ToUpper(name[0]) + name.Substring(1));
                    }
                }
                row["civ_licenses"] = activeLicenses;
                result.Add(row);
        };
        // Gang
        var sql1 = "SELECT id, name, members, bank, leader, tag FROM organisations WHERE alive = '1' AND members LIKE '%' + @pid + '%'";
        using (var command1 = new SqlCommand(sql1, connection))
        {
           command1.Parameters.AddWithValue("@pid", result[0]["playerid"]);
            using var reader1 = await command1.ExecuteReaderAsync();
            var gang =  new List<Gangs>();
            while (await reader1.ReadAsync())
            {
                var rawMembers = reader1["members"]?.ToString();
                var memberList = new List<GangMember>();

                if (!string.IsNullOrWhiteSpace(rawMembers))
                {
                    var fixedMembers = rawMembers.Replace("\"\"", "\"").Trim();

                    if (fixedMembers.StartsWith("\"") && fixedMembers.EndsWith("\""))
                    {
                        fixedMembers = fixedMembers[1..^1];
                    }

                    var members = JsonSerializer.Deserialize<List<object[]>>(fixedMembers);

                    if (members is not null)
                    {
                        foreach (var m in members)
                        {
                            memberList.Add(new GangMember(
                                m[2]?.ToString() ?? "",
                                m[0]?.ToString() ?? "",
                                int.Parse(m[1]?.ToString() ?? "1")
                            ));
                        }
                    }
                };

                var row1 = new Gangs(
                    reader1["id"].ToString() ?? string.Empty,
                    reader1["name"].ToString() ?? string.Empty,
                    memberList,
                    reader1["leader"].ToString() ?? string.Empty,
                    reader1["tag"].ToString() ?? string.Empty,
                    reader1["bank"].ToString() ?? string.Empty
                );
                gang.Add(row1);
            };
            row["gang"] = gang.FirstOrDefault()!;
        };

        // Housing
        var sql2 = "SELECT a.id, a.location, a.securityLevel, b.VirtualContents, b.Contents, a.timeBought, a.isOrgHouse FROM housing a INNER JOIN housinginvstorage b ON (a.HousingInvStorageID=b.id) WHERE a.alive = 1 AND a.ownerPid=@pid";
        using (var command2 = new SqlCommand(sql2, connection))
        {
            command2.Parameters.AddWithValue("@pid", result[0]["playerid"]);
            using var reader2 = await command2.ExecuteReaderAsync();
            var housing = new List<Houses>();
            while (await reader2.ReadAsync())
            {
                var row2 = new Houses(
                    reader2["id"].ToString() ?? string.Empty,
                    reader2["location"].ToString() ?? string.Empty,
                    reader2["securityLevel"].ToString() ?? string.Empty,
                    reader2["virtualContents"].ToString() ?? string.Empty,
                    reader2["Contents"].ToString() ?? string.Empty,
                    reader2["isOrgHouse"].ToString() ?? string.Empty,
                    reader2.GetDateTime(reader2.GetOrdinal("timeBought"))
                );
                housing.Add(row2);
            };
            row["housing"] = housing;
        };
        // Vehicles
        var sql3 = "Select id, side, classname, type, inventory, reg, capacity, security, acceleration, insert_time FROM vehicles where pid = @pid";
        using (var command3 = new SqlCommand(sql3, connection))
        {
            command3.Parameters.AddWithValue("@pid", result[0]["playerid"]);
            using var reader3 = await command3.ExecuteReaderAsync();
            var vehicles = new List<Vehicles>();
            while (await reader3.ReadAsync())
            {
                var row3 = new Vehicles(
                    reader3["id"].ToString() ?? string.Empty,
                    reader3["side"].ToString() ?? string.Empty,
                    reader3["classname"].ToString() ?? string.Empty,
                    reader3["type"].ToString() ?? string.Empty,
                    reader3["inventory"].ToString() ?? string.Empty,
                    reader3["reg"].ToString() ?? string.Empty,
                    reader3["capacity"].ToString() ?? string.Empty,
                    reader3["security"].ToString() ?? string.Empty,
                    reader3["acceleration"].ToString() ?? string.Empty,
                    reader3.GetDateTime(reader3.GetOrdinal("insert_time"))
                );
                vehicles.Add(row3);
            };
            row["vehicles"] = vehicles;
        };
        return result; 
    }

    public async Task<PaginatedRecord<Player>> SearchPlayersAsync(string search, int? limit, int? offset)
    {
        var totalRows = 0;
        var result = new List<Player>();
        using (var connection = new SqlConnection(connectionString))
        {
            await connection.OpenAsync();

            var sql = "SELECT TOP 15 uid, name, playerid, cash, bankacc, adminlevel, coplevel, ionlevel, mediclevel, last_seen, insert_time, COUNT(*) OVER() AS TotalRows From players WHERE name LIKE '%' + @search + '%' OR aliases LIKE '%' + @search + '%' OR playerid = @search OR CAST(uid AS NVARCHAR) = @search";

            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@search", search);
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                if (totalRows == 0)
                {
                    totalRows = reader.GetInt32(reader.GetOrdinal("TotalRows"));
                }
                var row = new Player(
                    reader["uid"].ToString() ?? string.Empty,
                    reader["name"].ToString() ?? string.Empty,
                    reader["playerid"].ToString() ?? string.Empty,
                    reader["cash"].ToString() ?? string.Empty,
                    reader["bankacc"].ToString() ?? string.Empty,
                    reader["adminLevel"].ToString() ?? string.Empty,
                    reader["copLevel"].ToString() ?? string.Empty,
                    reader["ionLevel"].ToString() ?? string.Empty,
                    reader["medicLevel"].ToString() ?? string.Empty,
                    reader.GetDateTime(reader.GetOrdinal("last_seen")),
                    reader.GetDateTime(reader.GetOrdinal("insert_time"))
                );
                result.Add(row);
            };
        };
        var response = new PaginatedRecord<Player>(
            totalRows,
            result
        );
        return response;
    }

    public async Task UpdateWhitelisting(HttpContext ctx, WhitelistUpdateRequest request)
    {
        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();
        using var transaction = connection.BeginTransaction();
        try{
            var userName = ctx.User.Identity?.Name ?? "Unknown";
            var userId = ctx.User.FindFirst("SteamID")?.Value ?? throw new UnauthorizedAccessException("There isn't a SteamId associated with your account!");
            var userAdmin = ctx.User.FindFirst("adminlevel")?.Value ?? "0";
            var adminWhitelistLevel = AppPermissions.GetPermission("User_Whitelist"); 
            var adminLevelCheck = Int32.Parse(userAdmin) < adminWhitelistLevel;

            foreach(var update in request.Updates)
            {
                string rank = update.Key;
                string value = update.Value;

                if (!FactionPermissions.ColumnToFactionMap.TryGetValue(rank, out var actualFaction))
                {
                    throw new InvalidDataException("Security Violation: Invalid Column Identifier or Permissions");
                }
                FactionPermissions.Factions.TryGetValue(actualFaction, out var factionTabke);
                var userRank = ctx.User.FindFirst(rank)?.Value ?? "0";
                var userMainRank = ctx.User.FindFirst(factionTabke.Name)?.Value ?? "0";
                var userRankToLow = Int32.Parse(userRank) < Int32.Parse(value);
                var userCommandCheck = Int32.Parse(userMainRank) < factionTabke.CommandRank;
                if (adminLevelCheck && userRankToLow && userCommandCheck)
                {
                    throw new UnauthorizedAccessException("Permission Violation!");
                }; 
                var sql = $"UPDATE players SET {rank} = @value WHERE playerid = @steamid";
                using (var command = new SqlCommand(sql, connection, transaction))
                {
                    command.Parameters.AddWithValue("@value", value);
                    command.Parameters.AddWithValue("@steamid", request.SteamId);
                    int reader = await command.ExecuteNonQueryAsync(); 
                }
                await _logging.AuditLog($"Rank Update", request.SteamId, userId, $"{rank} - {value}"); 
            }
            transaction.Commit();
        } catch (Exception)
        {
            transaction.Rollback();
            throw;
        }

    }

    public async Task<UpdateRank> UpdateRank(string id, string column, string newRank)
    {
        
        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();
        UpdateRankGet? oldData = null;
        var sqlGet = $"Select name, {column} FROM players WHERE uid = @id OR playerid = @id";
        using (var getCommand = new SqlCommand(sqlGet, connection))
        {
            getCommand.Parameters.AddWithValue("@rank", column);
            getCommand.Parameters.AddWithValue("@id", id);
            using var reader = await getCommand.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                throw new InvalidDataException("Failed to retrive Player details");
            };
            
            oldData = new UpdateRankGet(
                reader["name"].ToString() ?? string.Empty,
                reader[column].ToString() ?? string.Empty
            );
        };

        var sql = $"Update players SET {column} = @newRank where uid = @uid";

        using (var command = new SqlCommand(sql, connection))
        {    
            command.Parameters.AddWithValue("@uid", id);
            command.Parameters.AddWithValue("@newRank", newRank);
            int reader = await command.ExecuteNonQueryAsync();
            var oldRank = oldData.OldValue;
            var name = oldData.Name;
            var result = new UpdateRank (
                id.ToString() ?? string.Empty,
                name.ToString() ?? string.Empty,
                column.ToString() ?? string.Empty,
                oldRank.ToString() ?? string.Empty,
                newRank.ToString() ?? string.Empty,
                reader > 0 ? "Success" : "Failed"
            );
            return result; 
        };
    }

    public async Task<PlayerPerms> GetPlayerPerms(string id)
    {
        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        var sql = "SELECT playerid, adminlevel, coplevel, tfulevel, ncalevel, npaslevel, mpulevel, acadlevel, ionlevel, deltalevel, umlevel, iaflevel, irulevel, mediclevel, hemslevel, hartlevel, rplevel FROM players WHERE playerid = @uid";
        using (var command = new SqlCommand(sql, connection))
        {
            command.Parameters.AddWithValue("@uid", id);
            using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
                {
                    throw new InvalidDataException("Player Not Found For Permissions");
                };
            return new PlayerPerms(
                reader["playerid"].ToString() ?? string.Empty,
                int.Parse(reader["adminlevel"].ToString() ?? string.Empty),
                int.Parse(reader["CopLevel"].ToString() ?? string.Empty),
                int.Parse(reader["TfuLevel"].ToString() ?? string.Empty),
                int.Parse(reader["NcaLevel"].ToString() ?? string.Empty),
                int.Parse(reader["NpasLevel"].ToString() ?? string.Empty),
                int.Parse(reader["MpuLevel"].ToString() ?? string.Empty),
                int.Parse(reader["AcadLevel"].ToString() ?? string.Empty),
                int.Parse(reader["IonLevel"].ToString() ?? string.Empty),
                int.Parse(reader["DeltaLevel"].ToString() ?? string.Empty),
                int.Parse(reader["UmLevel"].ToString() ?? string.Empty),
                int.Parse(reader["IafLevel"].ToString() ?? string.Empty),
                int.Parse(reader["IruLevel"].ToString() ?? string.Empty),
                int.Parse(reader["MedicLevel"].ToString() ?? string.Empty),
                int.Parse(reader["HemsLevel"].ToString() ?? string.Empty),
                int.Parse(reader["HartLevel"].ToString() ?? string.Empty),
                int.Parse(reader["RpLevel"].ToString() ?? string.Empty)
            );
        };
    }
}