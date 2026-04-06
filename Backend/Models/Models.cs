namespace DecsPage.Models;

public record Player (
    string Id,
    string Name,
    string PlayerId,
    string Cash,
    string Bankacc,
    string AdminLevel,
    string CopLevel,
    string IonLevel,
    string MedicLevel,
    DateTime LastSeen,
    DateTime InsertTime
);

public record Vehicles (
    string Id,
    string Side,
    string Class,
    string Type,
    string Inventory,
    string Reg,
    string Capacity,
    string Security,
    string Acceleration,
    DateTime InsertTime
);

public record Houses (
    string Id,
    string Location,
    string SecurityLevel,
    string VirtualContents,
    string Contents,
    string IsOrgHouse,
    DateTime TimeBought
);

public record Gangs (
    string Id,
    string Name,
    List<GangMember> Members,
    string Leader,
    string Tag,
    string Bank
);

public record GangMember (
    string Name,
    string Id,
    int Rank
);

public record UpdateRankGet (
    string Name,
    string OldValue
);

public record UpdateRank (
    string Id,
    string Name,
    string RankName,
    string OldValue,
    string NewValue,
    string Outcome
);

public record Job (
    string Id,
    string Type,
    string Status,
    string Result,
    string Payload,
    bool Priority,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record LoginRequest(
    string Username, 
    string Password
);

public record ResetPassword(
    string Password,
    string ConfirmPassword
);

public record ChangePassword(
    string OldPassword,
    string NewPassword,
    string ConfirmNewPassword
);

public record UserDetails(
    int ID,
    string UserName,
    string PasswordHash,
    int AdminLevel,
    string SteamID,
    string ChangePassword
);

public record PlayerPerms(
    string ID,
    int AdminLevel,
    int CopLevel,
    int TfuLevel,
    int NcaLevel,
    int NpasLevel,
    int MpuLevel,
    int AcadLevel,
    int IonLevel,
    int DeltaLevel,
    int UmLevel,
    int IafLevel,
    int IruLevel,
    int MedicLevel,
    int HemsLevel,
    int HartLevel,
    int RpLevel
);

public record WhitelistUpdateRequest(
    string SteamId, 
    Dictionary<string, string> Updates
);

public record PaginatedRecord<T>(
    int TotalRows,
    IEnumerable<T> Data
);

public record LoginResponse(
    string Token,
    Permissions Permissions
);

public record Permissions(
    Dictionary<string, int> Admin
    // Dictionary<string, int> FactionCommands,
    // Dictionary<string, int> PromoteThresholds
);

public record PlayerLogs
{
    public string EventType { get; init; } = "";
    public string PlayerId { get; init; } = "";
    public string PerformedBy { get; init; } = "";
    public string TargetName { get; init; } = "";
    public string PerformedByName { get; init; } = "";
    public string Details { get; init; } = "";
    public DateTime CreatedAt { get; init; }
}

public class ApiException : Exception
{
    public string Code { get; }

    public ApiException(string message, string code) : base(message)
    {
        Code = code;
    }
}

public record DashboardPlayerStats
{
    public int Players { get; init; }
    public int Police { get; init; }
    public int PoliceCommand { get; init; }
    public int Tfu { get; init; }
    public int Nca { get; init; }
    public int Npas { get; init; }
    public int Mpu { get; init; }
    public int PolAcad { get; init; }
    public int Medics { get; init; }
    public int MedicsCommand { get; init; }
    public int Hems { get; init; }
    public int Hart { get; init; }
    public int MedAcad { get; init; }
    public int Ion { get; init; }
    public int IonCommand { get; init; }
    public int Delta { get; init; }
    public int Um { get; init; }
    public int Iaf { get; init; }
    public int IonAcad { get; init; }
}