import type { SxProps, Theme } from "@mui/material";
import type { CSSProperties } from "react";
import { DASHBOARD_COLORS } from "../components/dashboard/dashboard-theme";
import { copperGlossButtonSx } from "./button-color-themes";

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
export const primaryActionButtonSx: SxProps<Theme> = copperGlossButtonSx;

// Wrap a primary button's text content with this to keep it legible over the
// gloss overlay: <Button sx={primaryActionButtonSx}><ThemedButtonLabel>Save</ThemedButtonLabel></Button>
export const themedButtonLabelStyle: CSSProperties = {
  position: "relative",
  zIndex: 1,
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
  };
}

export function plainTableBodyRowSx(highlighted = false): SxProps<Theme> {
  return {
    "&&&": {
      backgroundColor: highlighted ? "rgba(226,167,22,0.18) !important" : "transparent !important",
      "& td": { color: `${DASHBOARD_COLORS.textPrimary} !important` },
      "&:hover": { backgroundColor: "rgba(147,168,60,0.12) !important" },
    },
  };
}
