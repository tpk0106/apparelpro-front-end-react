import { defaultBlueTableTheme, oliveCopperTableTheme, type TableColorTheme } from "./table-color-themes";

// The registry a future Settings screen reads to let a user pick the
// app-wide table color theme. Add a new named palette to table-color-themes.ts,
// then register it here (id + human-readable label) to make it selectable.
export interface TableThemeOption {
  id: string;
  label: string;
  theme: TableColorTheme;
}

export const TABLE_THEME_REGISTRY: TableThemeOption[] = [
  { id: "oliveCopper", label: "Olive & Copper", theme: oliveCopperTableTheme },
  { id: "skyBlueClassic", label: "Sky Blue (Classic)", theme: defaultBlueTableTheme },
];

// The app-wide default every table gets from useApparelProTable when it
// doesn't pass its own colorTheme.
export const DEFAULT_TABLE_THEME_ID = "oliveCopper";

export function getTableColorTheme(id: string): TableColorTheme {
  return TABLE_THEME_REGISTRY.find((option) => option.id === id)?.theme ?? oliveCopperTableTheme;
}
