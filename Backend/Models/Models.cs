namespace BackgroundJobs.Models;

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

public record Job (
    string Id,
    string Type,
    string Status,
    string Result,
    DateTime CreatedAt,
    DateTime InsertTime
);