import type { SxProps, Theme } from "@mui/material";
import { copperGlossButtonDeepSx, copperGlossButtonSx, copperTextColor } from "./button-color-themes";

// Named, swappable color palettes for useApparelProTable.ts. Each palette
// covers every color touchpoint the hook currently hardcodes (header,
// row/alt-row, row text, row hover, footer, pagination, edit-mode). Passing
// `colorTheme` to useApparelProTable overrides just that call site - every
// other table that doesn't pass one keeps the existing blue look byte-for-byte
// via defaultBlueTableTheme, which mirrors the hook's previous hardcoded values.
export interface TableColorTheme {
  headerBg: string;
  headerText: string;
  headerIconColor: string;
  rowBg: string;
  rowAltBg: string;
  rowText: string;
  rowBorder: string;
  rowIconColor: string;
  rowHoverBorder: string;
  rowHoverText: string;
  rowHoverBg: string;
  rowHoverIconColor: string;
  editBg: string;
  editText: string;
  // Icon color while the row is in edit mode - applies whether or not the
  // cursor is hovering it. Kept separate from rowIconColor/rowHoverIconColor
  // since editBg can be a light surface where those would wash out or vanish.
  editIconColor: string;
  footerBg: string;
  footerText: string;
  paginationBg: string;
  paginationText: string;
  // Optional - omit to leave MUI's native styling untouched (matches the
  // pre-existing look). Set to accent the "Rows per page" label and the
  // selected pagination page number independently of paginationText.
  paginationLabelColor?: string;
  paginationSelectedSx?: SxProps<Theme>;
  // Optional - the top-toolbar "+ New X" create button every table renders
  // via its own renderTopToolbarCustomActions. Since that button lives inside
  // the toolbar useApparelProTable already styles, this is applied centrally
  // here instead of needing every table file to set its own Button sx.
  createButtonSx?: SxProps<Theme>;
}

export const defaultBlueTableTheme: TableColorTheme = {
  headerBg: "#60a5fa",
  headerText: "#F4F6F8",
  headerIconColor: "#ffffff",
  rowBg: "#7CB9E8",
  rowAltBg: "#4B9CD3",
  rowText: "#000000",
  rowBorder: "rgba(0, 0, 0, 0.1)",
  rowIconColor: "#A855F7",
  rowHoverBorder: "#FFFFFF",
  rowHoverText: "#4B9CD3",
  rowHoverBg: "#000000",
  rowHoverIconColor: "#4169E1",
  editBg: "#FFFFFF",
  editText: "#000000",
  editIconColor: "#A855F7",
  footerBg: "#60a5fa",
  footerText: "#000000",
  paginationBg: "#60a5fa",
  paginationText: "#000000",
};

// Test palette for the Country table - approved rows/header/footer from the
// olive proposal, paired with the copper gloss button (variant 1, charcoal
// depth). Keep additional named palettes alongside this one as they're approved.
export const oliveCopperTableTheme: TableColorTheme = {
  headerBg: "#93A83C",
  headerText: "#14120A",
  headerIconColor: "#14120A",
  rowBg: "#4E5A22",
  rowAltBg: "#616F29",
  rowText: "#F4F6F8",
  rowBorder: "rgba(191, 168, 90, 0.16)",
  rowIconColor: "#F4F6F8",
  rowHoverBorder: "#93A83C",
  rowHoverText: "#F4F6F8",
  rowHoverBg: "#6E7E2D",
  rowHoverIconColor: "#C4DE5E",
  editBg: "#F6F2E4",
  editText: "#14120A",
  editIconColor: "#4E5A22",
  footerBg: "#6B7D2E",
  footerText: "#F4F6F8",
  paginationBg: "#6B7D2E",
  paginationText: "#F4F6F8",
  paginationLabelColor: copperTextColor,
  paginationSelectedSx: copperGlossButtonDeepSx,
  createButtonSx: copperGlossButtonSx,
};
