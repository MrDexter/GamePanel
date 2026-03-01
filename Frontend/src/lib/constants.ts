export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

export const formatMoney = (amount: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0, // Removes the .00 if you don't need it
  }).format(amount);
};

export const copRanks: Record<number, string> = {
    1: "PCSO",
    2: "PC",
    3: "SPC",
    4: "SGT",
    5: "DSGT",
    6: "INS",
    7: "DI",
    8: "DCC",
    9: "CI",
    10: "SI",
    11: "CSI"
};

export const medicRanks: Record<number, string> = {
    1: "NUR",
    2: "FR",
    3: "PAR",
    4: "DOC",
    5: "GP",
    6: "SUR",
    7: "CST",
    8: "CMO"
};

export const ionRanks: Record<number, string> = {
    1: "Rct.",
    2: "Pvt.",
    3: "LCpl.",
    4: "Cpl.",
    5: "Sgt.",
    6: "Lt.",
    7: "Cpt.",
    8: "Gen."
};