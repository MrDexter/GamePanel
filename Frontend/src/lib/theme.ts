export type ThemeMode = "light" | "dark" | "system";

const THEME_KEY = "decspage_theme";

export const getSystemTheme = (): "light" | "dark" => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const getStoredTheme = (): ThemeMode => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark" || saved === "system") return saved;
  return "system";
};

export const applyTheme = (theme: ThemeMode) => {
  const root = document.documentElement;
  const resolved = theme === "system" ? getSystemTheme() : theme;

  root.classList.remove("light", "dark");
  root.classList.add(resolved);
};

export const setTheme = (theme: ThemeMode) => {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
};