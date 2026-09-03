import { getDropdownFieldSx, getDropdownListboxSx } from "./dropdown-color-themes";
import { DEFAULT_DROPDOWN_THEME_ID, getDropdownColorTheme } from "./dropdown-theme-registry";

// Shared entry point for any Select/Autocomplete dropdown that wants the
// app-wide dropdown look. Omit themeId to get the current default (see
// dropdown-theme-registry.ts) - pass one to opt a single dropdown into a
// different palette without affecting any other.
//
// Usage for a MUI <Autocomplete>:
//   const { listboxSx } = useDropdownTheme();
//   <Autocomplete slotProps={{ listbox: { sx: listboxSx } }} ... />
//
// Usage for a MUI <TextField select> or <Select>:
//   const { fieldSx, listboxSx } = useDropdownTheme();
//   <TextField select sx={fieldSx} slotProps={{ select: { MenuProps: { slotProps: { paper: { sx: listboxSx } } } } }} ... />
export function useDropdownTheme(themeId: string = DEFAULT_DROPDOWN_THEME_ID) {
  const theme = getDropdownColorTheme(themeId);
  return {
    // The raw palette - for call sites that can't use fieldSx/listboxSx as-is
    // (e.g. a component whose label/select/menu-item colors are separate
    // props applied directly to those elements, not nested under a parent
    // wrapper) and need to build their own flat sx from the same hex values.
    theme,
    fieldSx: getDropdownFieldSx(theme),
    listboxSx: getDropdownListboxSx(theme),
  };
}
