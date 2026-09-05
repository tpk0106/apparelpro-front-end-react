import { createTheme, type Theme } from "@mui/material";
import { oliveCopperTableTheme } from "./table-color-themes";

// The app-wide theme skins MuiTableRow/MuiTableCell for Material React
// Table grids (forced blue zebra rows, !important black cell text, blue
// header fill) - works there, but makes a plain reporting <Table> nearly
// unreadable (e.g. a muted "Cum:" sub-line loses almost all contrast
// against the forced blue row background). This targets the exact same
// styleOverrides keys the app-wide theme sets, so createTheme's merge
// replaces those specific values for any table wrapped in this theme,
// rather than fighting a CSS specificity/!important war.
//
// Pulls straight from oliveCopperTableTheme (the same palette every MRT
// table in the app uses via useApparelProTable) instead of a flatter
// DASHBOARD_COLORS-only look - a header/body sharing near-identical dark
// tones read as "no theme" next to the bold olive header band every other
// table in the app has, so this matches that band exactly for consistency.
const t = oliveCopperTableTheme;

export const withReadableReportTable = (outerTheme: Theme) =>
  createTheme(outerTheme, {
    components: {
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: "none",
            "&:nth-of-type(even)": { backgroundColor: `${t.rowBg} !important` },
            "&:nth-of-type(odd)": { backgroundColor: `${t.rowAltBg} !important` },
            "& td": { color: `${t.rowText} !important` },
            "& .MuiSvgIcon-root, & .MuiIconButton-root, & .MuiIconButton-root .MuiSvgIcon-root": {
              color: `${t.rowIconColor} !important`,
            },
            "&.Mui-editingRow, &[data-editing='true']": {
              backgroundColor: `${t.rowBg} !important`,
              "& td": { color: `${t.rowText} !important` },
            },
            "&.MuiTableBodyRow-root:hover, &:hover": {
              backgroundColor: `${t.rowHoverBg} !important`,
              "& td": { color: `${t.rowHoverText} !important` },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          body: {
            backgroundColor: "transparent",
            color: t.rowText,
            borderBottom: `1px solid ${t.rowBorder}`,
          },
          head: {
            backgroundColor: t.headerBg,
            color: t.headerText,
            fontWeight: 700,
            borderBottom: `2px solid ${t.headerBg}`,
          },
          footer: {
            backgroundColor: t.footerBg,
            color: t.footerText,
          },
        },
      },
    },
  });
