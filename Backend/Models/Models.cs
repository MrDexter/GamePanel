namespace DecsPage.Models;

public record Player (
    string Id,
    string Name,
    string PlayerId,
    string Cash,
    string Bankacc,
    string CartelCredits,
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
    object Payload,
    DateTime CreatedAt,
    DateTime InsertTime
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