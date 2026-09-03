import type { SxProps, Theme } from "@mui/material";

// Named, swappable palettes for any Select/Autocomplete dropdown in the app -
// the dropdown equivalent of table-color-themes.ts. Nothing here is meant to
// be hardcoded at the call site: components should go through
// useDropdownTheme() (see useDropdownTheme.ts) so a future palette swap only
// touches this file and the registry, never individual screens.
export interface DropdownColorTheme {
  panelBg: string;
  panelBorder: string;
  optionText: string;
  optionHoverBg: string;
  optionSelectedBg: string;
  optionSelectedText: string;
  fieldBg: string;
  fieldText: string;
  fieldBorder: string;
  fieldBorderHover: string;
  fieldBorderFocus: string;
  labelText: string;
  labelFocusText: string;
  iconColor: string;
}

export const oliveDropdownTheme: DropdownColorTheme = {
  panelBg: "#1a1710",
  panelBorder: "rgba(191,168,90,0.16)",
  optionText: "#F6F2E4",
  optionHoverBg: "rgba(147,168,60,0.16)",
  optionSelectedBg: "rgba(147,168,60,0.28)",
  optionSelectedText: "#C4DE5E",
  fieldBg: "#1a1710",
  fieldText: "#F6F2E4",
  fieldBorder: "rgba(191,168,90,0.16)",
  fieldBorderHover: "#93A83C",
  fieldBorderFocus: "#C4DE5E",
  labelText: "#B7AE86",
  labelFocusText: "#C4DE5E",
  iconColor: "#B7AE86",
};

// The popup panel (Autocomplete listbox, or a Select's Menu paper).
export function getDropdownListboxSx(t: DropdownColorTheme): SxProps<Theme> {
  return {
    backgroundColor: `${t.panelBg} !important`,
    border: `1px solid ${t.panelBorder}`,
    "& .MuiAutocomplete-option, & .MuiMenuItem-root": {
      color: `${t.optionText} !important`,
    },
    "& .MuiAutocomplete-option.Mui-focused, & .MuiMenuItem-root:hover": {
      backgroundColor: `${t.optionHoverBg} !important`,
    },
    '& .MuiAutocomplete-option[aria-selected="true"], & .MuiMenuItem-root.Mui-selected': {
      backgroundColor: `${t.optionSelectedBg} !important`,
      color: `${t.optionSelectedText} !important`,
    },
    '& .MuiAutocomplete-option[aria-selected="true"].Mui-focused': {
      backgroundColor: `${t.optionSelectedBg} !important`,
    },
  };
}

// MenuProps for a native <TextField select>/<Select>'s popup paper - pass as
// `slotProps={{ select: { MenuProps: getDropdownSelectMenuProps(theme) } }}`
// (or MRT's `muiEditTextFieldProps.slotProps.select.MenuProps`). Complements
// getDropdownListboxSx above, which is for <Autocomplete> instead.
export function getDropdownSelectMenuProps(t: DropdownColorTheme) {
  return {
    slotProps: {
      paper: {
        sx: {
          backgroundColor: `${t.panelBg} !important`,
          border: `1px solid ${t.panelBorder}`,
        },
      },
    },
  };
}

// Per-<MenuItem> sx to pair with getDropdownSelectMenuProps - MUI does not
// let the Menu's own paper sx cascade text/hover/selected colors down into
// each option, so every MenuItem needs this applied directly.
export function getDropdownMenuItemSx(t: DropdownColorTheme) {
  return {
    color: `${t.optionText} !important`,
    "&:hover": { backgroundColor: `${t.optionHoverBg} !important` },
    "&.Mui-selected": {
      backgroundColor: `${t.optionSelectedBg} !important`,
      color: `${t.optionSelectedText} !important`,
    },
  };
}

// The closed field itself (TextField/Select/FormControl outline, label, icon).
// Wrapped in "&&" - the app's global MuiTextField theme override (themes.ts)
// sets its own ".MuiInputLabel-root.MuiInputLabel-shrink" / ".Mui-focused"
// colors (a leftover indigo/purple), and that selector's extra modifier class
// carries more specificity than a plain single-class sx override, so without
// the "&&" boost here the theme's indigo silently wins over this palette.
export function getDropdownFieldSx(t: DropdownColorTheme): SxProps<Theme> {
  return {
    "&&": {
      "& .MuiInputLabel-root": {
        color: `${t.labelText} !important`,
        "&.MuiInputLabel-shrink": { color: `${t.labelText} !important` },
        // Explicit compound selector (3 classes) beats the shrink-only rule
        // (2 classes) outright, instead of relying on declaration-order
        // tie-breaking between two equal-specificity rules, which was
        // silently losing to the shrink color even while focused.
        "&.Mui-focused, &.Mui-focused.MuiInputLabel-shrink": {
          color: `${t.labelFocusText} !important`,
        },
      },
      "& .MuiOutlinedInput-root": {
        backgroundColor: t.fieldBg,
        color: `${t.fieldText} !important`,
        "& .MuiSelect-select": { color: `${t.fieldText} !important` },
        "& .MuiOutlinedInput-input": { color: `${t.fieldText} !important` },
        "& fieldset": { borderColor: t.fieldBorder },
        "&:hover fieldset": { borderColor: t.fieldBorderHover },
        "&.Mui-focused fieldset": { borderColor: t.fieldBorderFocus, borderWidth: "2px" },
      },
      // variant="standard" fields (used in dense inline grid cells) don't have
      // a MuiOutlinedInput-root at all - they use MuiInput's underline instead,
      // which otherwise defaults to the app's primary blue on focus/hover.
      "& .MuiInput-root": {
        color: `${t.fieldText} !important`,
        "& .MuiSelect-select": { color: `${t.fieldText} !important` },
        "& .MuiInputBase-input": { color: `${t.fieldText} !important` },
      },
      "& .MuiInput-underline:before": { borderBottomColor: `${t.fieldBorder} !important` },
      "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
        borderBottomColor: `${t.fieldBorderHover} !important`,
      },
      "& .MuiInput-underline:after": { borderBottomColor: `${t.fieldBorderFocus} !important` },
      "& .MuiSvgIcon-root": { color: `${t.iconColor} !important` },
    },
  };
}
