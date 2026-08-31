import { oliveDropdownTheme, type DropdownColorTheme } from "./dropdown-color-themes";

// Registry a future Settings screen can read to let a user pick the app-wide
// dropdown palette - mirrors table-theme-registry.ts. Add a new named palette
// to dropdown-color-themes.ts, then register it here to make it selectable.
export interface DropdownThemeOption {
  id: string;
  label: string;
  theme: DropdownColorTheme;
}

export const DROPDOWN_THEME_REGISTRY: DropdownThemeOption[] = [
  { id: "olive", label: "Olive", theme: oliveDropdownTheme },
];

export const DEFAULT_DROPDOWN_THEME_ID = "olive";

export function getDropdownColorTheme(id: string): DropdownColorTheme {
  return DROPDOWN_THEME_REGISTRY.find((option) => option.id === id)?.theme ?? oliveDropdownTheme;
}
