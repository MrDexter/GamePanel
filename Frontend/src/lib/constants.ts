import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export function useQueryParams() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const updateParams = (
    params: Record<string, string | number | null | boolean | undefined>,
    replace = false
  ) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });

    navigate(
      {
        pathname: location.pathname,
        search: newParams.toString() ? `?${newParams.toString()}` : "",
      },
      {
        replace,
        state: location.state,
      }
    );
  };

  return { searchParams, updateParams };
}

export const formatDate = (dateString: string, includeTime: boolean = false) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit"
    })
  });
};

export const formatMoney = (amount: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0, // Removes the .00 if you don't need it
  }).format(amount);
};

export const formatMoneyCompact = (amount: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Text copied to clipboard!");
};

export const APP_CONFIG = {
} as const;

export const copRanks: Record<number, string> = {
    0: "None",
    1: "PCSO",
    2: "PC",
    3: "SPC",
    4: "SGT",
    5: "DSGT",
    6: "INS",
    7: "DI",
    8: "DCI",
    9: "CI",
    10: "SI",
    11: "CSI"
};

export const medicRanks: Record<number, string> = {
    0: "None",
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
    0: "None",
    1: "Rct.",
    2: "Pvt.",
    3: "LCpl.",
    4: "Cpl.",
    5: "Sgt.",
    6: "Lt.",
    7: "Cpt.",
    8: "Gen."
};

export const unitNames: Record<string, string> = {
  "acadlevel": "Academy",
  "tfulevel": "TFU",
  "ncalevel": "NCA",
  "npaslevel": "NPAS",
  "mpulevel": "MPU",
  "hemslevel": "HEMS",
  "hartlevel": "HART",
  "deltalevel": "Delta",
  "umlevel": "UM",
  "iaflevel": "AIR",
  "irulevel": "Academy",
  "rplevel": "Academy",
  "ionlevel": "Ion",
  "coplevel": "Police",
  "mediclevel": "NHS"
};

export const unitRankNames: Record<string, Record<number, string>> = {
  // Police
  tfulevel: { 0: "None", 1: "Guest", 2: "Member", 3: "Marksman", 4: "Senior", 5: "Lead" },
  ncalevel: { 0: "None", 1: "Guest", 2: "Member", 3: "Trained", 4: "Senior", 5: "Lead" },
  npaslevel: { 0: "None", 1: "Tier 1", 2: "Tier 2", 3: "Tier 3", 4: "Lead" },
  mpulevel: { 0: "None", 1: "Basic", 2: "Advanced", 3: "Full", 4: "Lead" },
  acadlevel: { 0: "None", 1: "Trainee", 2: "Trainer", 3: "Senior", 4: "Lead" },
  // Ion
  deltalevel: { 0: "None", 1: "Guest", 2: "Member", 3: "Advanced", 4: "Senior", 5: "Lead" },
  iaflevel: { 0: "None", 1: "Tier 1", 2: "Tier 2", 3: "Tier 3", 4: "Lead" },
  umlevel: { 0: "None", 1: "Basic", 2: "Advanced", 3: "Full", 4: "Lead" },
  irulevel: { 0: "None", 1: "Trainee", 2: "Trainer", 3: "Senior", 4: "Lead" },
  // Medic
  hemslevel: { 0: "None", 1: "Basic", 2: "Advanced", 3: "Full", 4: "Lead" },
  hartlevel: { 0: "None", 1: "Basic", 2: "Advanced", 3: "Full", 4: "Lead" },
  rplevel: { 0: "None", 1: "Trainee", 2: "Trainer", 3: "Senior", 4: "Lead" },

  coplevel: copRanks,
  mediclevel: medicRanks,
  ionlevel: ionRanks
};

export const FACTIONS = [
  { id: 'police', label: 'Police', colorText: 'text-blue-500', colorBg: 'bg-blue-500', colorBorder: 'border-red-500', color: 'from-blue-500', levelKey: 'coplevel', ranks: copRanks, units: ["tfulevel", "ncalevel", "npaslevel", "mpulevel", "acadlevel",], login: 'cop_login', playtime: 'playtime_cop', commandLevel: 10},
  { id: 'medic', label: 'Medics', colorText: 'text-green-500', colorBg: 'bg-green-500', colorBorder: 'border-red-500', color: 'from-green-500', levelKey: 'mediclevel', ranks: medicRanks, units: ["hemslevel", "hartlevel", "rplevel"], login: 'nhs_login', playtime: 'playtime_nhs', commandLevel: 7},
  { id: 'ion', label: 'Ion', colorText: 'text-red-500', colorBg: 'bg-red-500', colorBorder: 'border-red-500', color: 'from-red-500', levelKey: 'ionlevel', ranks: ionRanks, units: ["deltalevel", "umlevel", "iaflevel", null, "irulevel" ], login: 'van_login', playtime: 'playtime_opfor', commandLevel: 6}, // Null for a unit filler for better layout
];

export const JOB_TYPE_LABELS: Record<string, string> = {
  playerExport: "Player Export",
  playersExport: "Players Export",
  gangsExport: "Groups Export",
  gangExport: "Group Export",
  jobExport: "Job Export",
  jobsExport: "Jobs Export",
  orderFulfilment: "Order Fulfilment"
};