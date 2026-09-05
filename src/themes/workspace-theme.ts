import type { SxProps, Theme } from "@mui/material";
import type { CSSProperties } from "react";
import { DASHBOARD_COLORS } from "../components/dashboard/dashboard-theme";
import { copperGlossButtonSx, copperTextColor } from "./button-color-themes";
import { getTableColorTheme, DEFAULT_TABLE_THEME_ID } from "./table-theme-registry";

const plainTableColorTheme = getTableColorTheme(DEFAULT_TABLE_THEME_ID);

// Reusable pieces for workspace pages (STRN/GIN/GRN/etc.) that render their
// own hand-rolled <Table> line-item grids and standalone <Button> actions
// instead of going through useApparelProTable - so those pages need explicit
// wiring rather than getting the table theme "for free". Import from here
// instead of re-deriving the same sx per file, so a future palette change
// only touches this one place.

// The page's main <Typography variant="h5"> title - same olive treatment as
// every reference page's heading (e.g. "COUNTRIES", "BANK").
export const workspaceHeadingSx: SxProps<Theme> = {
  fontWeight: "bold",
  color: DASHBOARD_COLORS.accentStrong,
  textShadow: "0 2px 6px rgba(0,0,0,0.6), 0 1px 0 rgba(0,0,0,0.4)",
  textAlign: "center",
  // Baked in here (rather than left to each caller to add) so every page's
  // heading is capitalized "for free" and consistently - several Note
  // workspaces (STRN/GIN/GRN/RTN/GTN/DGN/SAN/AIN/ARN/SRN) were spreading
  // this without their own textTransform override, so their headings stayed
  // in Title Case while every other reworked screen was uppercase.
  textTransform: "uppercase",
};

// The small info/instruction line under the heading (e.g. "GRN Number is
// allocated by the server on commit..."). Matches the one workspace that
// already had this right (Damaged Goods Note) - reuse this instead of each
// file setting (or forgetting to set) its own color.
export const workspaceInfoCaptionSx: SxProps<Theme> = {
  display: "block",
  color: DASHBOARD_COLORS.textSecondary,
};

// The bold section label above the line-item table (e.g. "Pending Material
// Lines", "Returnable Material Lines", "Damageable Material Lines"). Several
// workspaces left this with no color at all, falling back to an invisible
// default - this is the fix, same color family as workspaceInfoCaptionSx so
// the two read as one consistent voice, just bolder for the label.
export const workspaceSectionLabelSx: SxProps<Theme> = {
  fontWeight: "bold",
  textTransform: "uppercase",
  color: DASHBOARD_COLORS.textSecondary,
};

// The primary action button (Save/Submit/Add). Includes the copper gloss
// treatment - spread this LAST if you also set minWidth/height/disabled sx so
// your overrides win. Wrap the button's text in the exported span helper
// below so it stays above the gloss's ::before/::after highlight layers.
// Deliberately untyped (no `: SxProps<Theme>`) - see button-color-themes.ts's
// note on copperGlossButtonSx for why: that broader type can't be spread
// inside a nested selector object, only as a top-level `sx` prop value.
export const primaryActionButtonSx = copperGlossButtonSx;

// Wrap a primary button's text content with this to keep it legible over the
// gloss overlay: <Button sx={primaryActionButtonSx}><ThemedButtonLabel>Save</ThemedButtonLabel></Button>
export const themedButtonLabelStyle: CSSProperties = {
  position: "relative",
  zIndex: 1,
};

// Tab bars (Settings' "System Parameters"/"Users & Groups", and Users &
// Groups' own "Groups"/"Users"/"Permission Matrix" sub-tabs) - copper label
// text on the selected tab and indicator, matching the copper section
// headings used alongside them. Spread into the Tabs component's own sx
// (merge with any borderBottom the caller already sets).
export const copperTabsSx: SxProps<Theme> = {
  "& .MuiTab-root": {
    color: DASHBOARD_COLORS.textSecondary,
    fontWeight: 600,
    textTransform: "none",
  },
  "& .MuiTab-root.Mui-selected": {
    color: copperTextColor,
  },
  "& .MuiTabs-indicator": {
    backgroundColor: copperTextColor,
  },
};

// A line's "remove/delete this row" IconButton (renderRowActions on Note
// grids, both Orderwise and General Inventory). `color="error"` alone renders
// MUI's default red, which reads too dark/muddy against these tables' dark
// row backgrounds - white keeps it legible and consistent everywhere this
// action appears, while the red still shows on hover via the IconButton's
// own hover background. Spread alongside (not instead of) `color="error"`.
export const deleteRowIconButtonSx: SxProps<Theme> = {
  color: "#FFFFFF",
  "&:hover": { color: "#FFFFFF" },
};

// For hand-rolled <Table> grids (not MRT/useApparelProTable). themes.ts's
// global MuiTableRow override forces blue zebra rows via
// "&:nth-of-type(even/odd)" with !important - that compound selector's
// specificity (0,2,0) TIES with a plain "&&" (doubled single-class) override,
// and ties are broken unpredictably by stylesheet insertion order. "&&&"
// (0,3,0) guarantees a win regardless of order. Always use "&&&" here, never
// a plain sx object, for any row in a hand-rolled table.
export function plainTableHeaderRowSx(): SxProps<Theme> {
  return {
    "&&&": {
      backgroundColor: `${DASHBOARD_COLORS.accent} !important`,
    },
  };
}

// themes.ts's global MuiTableCell "head" styleOverride paints each header
// cell with an opaque backgroundColor: "#60a5fa" directly - since cells sit
// visually in front of their row, that occludes plainTableHeaderRowSx's olive
// row background entirely, even though the row itself is styled correctly.
// Every header TableCell needs this explicit override too, not just the row.
export function plainTableHeaderCellSx(): SxProps<Theme> {
  return {
    fontWeight: "bold",
    color: "#14120A !important",
    backgroundColor: `${DASHBOARD_COLORS.accent} !important`,
    textTransform: "uppercase",
  };
}

// Orderwise Inventory Note grids (GIN/GRN/RTN/GTN/DGN/SAN/AIN/ARN/SRN) all
// go through useApparelProTable(), which doesn't uppercase header text by
// default. Pass as `muiTableHeadCellProps: noteTableHeadCellUppercaseSx` on
// any of those tables' useApparelProTable() call to match the capitalized
// header convention used across every Note workspace.
export const noteTableHeadCellUppercaseSx = {
  sx: { textTransform: "uppercase" as const },
};

// The native <input type="date"> calendar icon is a browser-drawn SVG whose
// glyph color is fixed black, unaffected by the field's own text/icon color -
// it renders invisible against this app's dark field backgrounds. There's no
// direct "set this icon to hex X" CSS property for it, so this approximates
// the same tan/khaki tone as the dropdown arrow (oliveDropdownTheme.iconColor,
// #B7AE86) via a filter on the black glyph. Spread this alongside a field's
// own sx (it has no overlapping keys with dropdownFieldSx/selectFieldSx).
export const dateIconFieldSx: SxProps<Theme> = {
  // Was scoped to input[type='date'] only, which silently never matched
  // type="month" fields (Production Summary Monthly, Employee Efficiency
  // Monthly, Line Efficiency, etc.) - their calendar icon stayed the
  // browser's default black glyph, invisible on this app's dark fields.
  // Every native date-ish input type gets the same picker-indicator
  // pseudo-element, so drop the type qualifier to cover all of them.
  "& input::-webkit-calendar-picker-indicator": {
    filter:
      "invert(78%) sepia(11%) saturate(694%) hue-rotate(358deg) brightness(88%) contrast(85%)",
    cursor: "pointer",
  },
};

// The browser's native up/down spinner buttons on <input type="number"> - at
// this app's compact table row-height, the spinner arrows dominate the field
// and make a simple one-line Quantity input look like a multi-line control.
// Spread this alongside a numeric field's own sx to render it as plain text
// entry instead (WebKit/Blink hide the inner spin-button element directly;
// Firefox has no separate element to target, so -moz-appearance is the only
// way to remove it there).
// Deliberately untyped (no `: SxProps<Theme>`) - same reasoning as
// dateIconFieldSx's note elsewhere in this file: this is always spread
// alongside another sx object (`{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }`),
// never used standalone as a bare `sx` value, and SxProps<Theme>'s broader
// union type can't be spread back into another SxProps<Theme>-typed object
// without a cast at every call site.
export const numberFieldNoSpinnerSx = {
  "& input[type='number']": {
    MozAppearance: "textfield",
  },
  "& input[type='number']::-webkit-outer-spin-button, & input[type='number']::-webkit-inner-spin-button":
    {
      WebkitAppearance: "none",
      margin: 0,
    },
};

// FIXED: previously every row (highlighted=false) got a flat "transparent"
// background regardless of position, so hand-rolled tables never showed the
// alternating row/alt-row zebra striping every MRT table (via
// useApparelProTable) gets automatically - "still legacy theme" as reported.
// rowIndex drives the same rowBg/rowAltBg alternation from the same table
// palette used everywhere else, so a hand-rolled table reads identically to
// a real useApparelProTable one.
// The single canonical "selected/active row" treatment for the whole app -
// copied verbatim from material-consumption/material-master-list.component.tsx
// (the original source of this pattern: a saturated copper fill + left
// border + dark bold text, chosen so it stays visible regardless of which
// alternating zebra shade sits underneath it). Any table anywhere that needs
// to show "this is the row currently loaded/selected/being edited" - MRT
// (muiTableBodyRowProps) or hand-rolled (<TableRow sx={...}>) - should apply
// this instead of inventing its own selected-row color, so the whole package
// reads as one consistent pattern.
export const selectedRowHighlightBg = copperTextColor;
export const selectedRowHighlightBorder = "#6B4420";
export const selectedRowHighlightText = "#2B1B0E";

export function selectedRowHighlightSx(isSelected: boolean): SxProps<Theme> {
  return isSelected
    ? {
        backgroundColor: `${selectedRowHighlightBg} !important`,
        borderLeft: `4px solid ${selectedRowHighlightBorder} !important`,
        "& td": { color: `${selectedRowHighlightText} !important`, fontWeight: "bold" },
      }
    : {};
}

// Copper warning color for "exceeded balance" style validation text (e.g. a
// caption under a Quantity field) - MUI's default `color="error"` red reads
// as harsh/high-eye-strain against this app's dark palette; copper matches
// the row highlight below and the rest of the theme's accent family.
export const balanceDeficitTextColor = copperTextColor;

// "Exceeded balance" row highlight - copper to match the app's warning
// accent (see balanceDeficitTextColor below). Was rgba(226,167,22,0.18) -
// amber at only 18% opacity, composited over the table body's near-black
// canvas (#0A0E14, see themes.ts's MuiTable override) that reads as a dim,
// muddy near-black rather than a visible highlight. 0.38 keeps it readable
// without turning solid/opaque.
const balanceDeficitRowBg = "rgba(201,128,61,0.38)";
// Hover previously fell through to the same rowHoverBg as every other row
// regardless of `highlighted`, so hovering a deficit row masked the warning
// entirely - keep the copper tone on hover too, just a touch stronger so the
// hover state still reads as distinct.
const balanceDeficitRowHoverBg = "rgba(201,128,61,0.55)";

export function plainTableBodyRowSx(rowIndex: number, highlighted = false): SxProps<Theme> {
  return {
    "&&&": {
      backgroundColor: highlighted
        ? `${balanceDeficitRowBg} !important`
        : `${rowIndex % 2 === 0 ? plainTableColorTheme.rowAltBg : plainTableColorTheme.rowBg} !important`,
      "& td": { color: `${plainTableColorTheme.rowText} !important` },
      "&:hover": {
        backgroundColor: `${highlighted ? balanceDeficitRowHoverBg : plainTableColorTheme.rowHoverBg} !important`,
      },
      // themes.ts's global MuiTableRow styleOverride forces every row icon to
      // a hardcoded blue ("& .MuiSvgIcon-root, & .MuiIconButton-root") via a
      // compound selector + !important - useApparelProTable's own hook
      // already defeats this the same way for MRT tables, but a hand-rolled
      // table using this function had no equivalent override, so its icons
      // (e.g. deleteRowIconButtonSx on a row's Delete button) silently lost
      // to that global blue regardless of their own sx. "&&&" here matches
      // the specificity this needs to win.
      "& .MuiSvgIcon-root, & .MuiIconButton-root, & .MuiIconButton-root .MuiSvgIcon-root": {
        color: `${plainTableColorTheme.rowIconColor} !important`,
      },
      "&:hover .MuiSvgIcon-root, &:hover .MuiIconButton-root, &:hover .MuiIconButton-root .MuiSvgIcon-root":
        {
          color: `${plainTableColorTheme.rowHoverIconColor} !important`,
        },
    },
  };
}
