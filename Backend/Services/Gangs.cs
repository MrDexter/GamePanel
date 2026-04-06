using Microsoft.Data.SqlClient;
using DecsPage.Models;
using System.Text.Json;

namespace DecsPage.Services;

public interface IGangService
{
    Task<PaginatedRecord<Gangs>>GetAllGangs(int? limit, int? offset, string? search);   
    Task<List<Dictionary<string,object>>>GetGang(string id);
}

public class GangService : IGangService
{
    private readonly string connectionString;
    public GangService(IConfiguration config)
    {
        connectionString = config.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Missing Default Connection");
    }

    public async Task<PaginatedRecord<Gangs>>GetAllGangs(int? limit, int? offset, string? search)
    {
        int totalRows = 0;
        var result = new List<Gangs>();
        using (var connection = new SqlConnection(connectionString))
        {
        await connection.OpenAsync();

        var sql = "Select id, name, members, leader, tag, bank, COUNT(*) OVER() AS TotalRows FROM organisations WHERE alive = 1";
        if (!string.IsNullOrWhiteSpace(search))
        {
            sql += @" AND (name LIKE '%' + @search + '%' OR members LIKE '%' + @search + '%' OR tag = @search OR CAST(id AS NVARCHAR) = @search)";
        };
        if (limit.HasValue || offset.HasValue)
        {
            sql += " ORDER BY id OFFSET @offset ROWS";
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
                var rawMembers = reader["members"]?.ToString();
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
                var tagRaw = reader["tag"]?.ToString() ?? string.Empty;
                var tag = tagRaw.Trim('"');
                var row = new Gangs(
                    reader["id"].ToString() ?? string.Empty,
                    reader["name"].ToString() ?? string.Empty,
                    memberList,
                    reader["leader"].ToString() ?? string.Empty,
                    tag,
                    reader["bank"].ToString() ?? string.Empty
                );
                result.Add(row);
            };
        };
        var response = new PaginatedRecord<Gangs>(
            totalRows,
            result
        );
        return response;
    }

    public async Task<List<Dictionary<string, object>>>GetGang(string id)
    {
        var result = new List<Dictionary<string, object>>();
        var row = new Dictionary<string, object>();
        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();
        var sql = "Select * FROM organisations WHERE alive = 1 and id = @id OR name LIKE '%' + @id + '%' OR  tag LIKE '%' + @id + '%'";
        using (var command = new SqlCommand(sql, connection))
        {
            command.Parameters.AddWithValue("@id", id);
            using var reader = await command.ExecuteReaderAsync();
            if(!await reader.ReadAsync())
            {
                throw new InvalidDataException("Group Not Found");
            };
            for (int i=0; i < reader.FieldCount; i++)
            {
              row[reader.GetName(i)] = reader.GetValue(i);  
            };
            result.Add(row);
        };
        // Housing
        var sql2 = "SELECT a.id, a.location, a.securityLevel, b.VirtualContents, a.timeBought FROM housing a INNER JOIN housinginvstorage b ON (a.HousingInvStorageID=b.id) WHERE a.alive = 1 AND a.orgid=@id AND a.isOrgHouse=1";
        using (var command2 = new SqlCommand(sql2, connection))
        {
            command2.Parameters.AddWithValue("@id", result[0]["id"]);
            using var reader2 = await command2.ExecuteReaderAsync();
            var housing = new Dictionary<string, object>();
            var count = 0;
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
              count = count + 1;
              housing["House " + count] = row2;
            };
            row["Housing"] = housing;
        }
        return result;
    }
}