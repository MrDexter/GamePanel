

namespace DecsPage.Constants;
public static class AppPermissions
{
    public static readonly Dictionary<string, int> AdminPermissions = new ()
    {
        {"USER_LOGS", 3},
        {"EXPORT_DATA", 3},
        {"USER_WHITELIST", 4},
        {"USER_RESET", 4},
        {"USER_CREATE", 5},
        {"USER_DELETE", 5},
        {"JOB_MANAGEMENT", 4}
    };

    public static int GetPermission(string key) => 
        AdminPermissions.GetValueOrDefault(key, 99); 
}

public static class FactionPermissions
{
    public static readonly Dictionary<string, string> ColumnToFactionMap = new()
    {
        { "coplevel", "police" }, { "tfulevel", "police" }, { "ncalevel", "police" }, { "npaslevel", "police" }, { "mpulevel", "police" }, { "acadlevel", "police" },
        { "mediclevel", "medic" }, { "hemslevel", "medic" }, { "hartlevel", "medic" }, { "rplevel", "medic" }, 
        { "ionlevel", "opfor" }, { "deltalevel", "opfor" }, { "umlevel", "opfor" }, { "iaflevel", "opfor" }, { "irulevel", "opfor" }
    };

    public static readonly Dictionary<string, (string Name, int CommandRank)> Factions = new()
    {
        { "police", (Name: "coplevel", CommandRank: 10) },
        { "opfor",  (Name: "ionlevel", CommandRank:  7) },
        { "medic",  (Name: "mediclevel", CommandRank:  6) }
    };

    public static readonly Dictionary<string, int> PromoteThresholds = new()
    {
        { "adminlevel", 1 },
        { "coplevel", 7 },
        { "tfulevel", 4 },
        { "ncalevel", 4 },
        { "npaslevel", 4 },
        { "mpulevel", 4 },
        { "acadlevel", 2 },
        { "ionlevel", 6 },
        { "deltalevel", 4 },
        { "umlevel", 4 },
        { "iaflevel", 4 },
        { "irulevel", 3 },
        { "mediclevel", 4 },
        { "hemslevel", 4 },
        { "hartlevel", 4 },
        { "rplevel", 4 }
    };
}