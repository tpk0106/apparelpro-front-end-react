import { createTheme, type Theme } from "@mui/material";
import { DASHBOARD_COLORS } from "../components/dashboard/dashboard-theme";

// The app-wide theme skins MuiTableRow/MuiTableCell for Material React
// Table grids (forced blue zebra rows, !important black cell text, blue
// header fill) - works there, but makes a plain reporting <Table> nearly
// unreadable (e.g. a muted "Cum:" sub-line loses almost all contrast
// against the forced blue row background). This targets the exact same
// styleOverrides keys the app-wide theme sets, so createTheme's merge
// replaces those specific values for any table wrapped in this theme,
// rather than fighting a CSS specificity/!important war.
//
// Colors pulled from DASHBOARD_COLORS/the olive-copper table palette so every
// report table matches the rest of the app instead of the old flat dark-grey
// (#20242C) header that predated that palette.
export const withReadableReportTable = (outerTheme: Theme) =>
  createTheme(outerTheme, {
    components: {
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: "none",
            "&:nth-of-type(even)": { backgroundColor: "transparent !important" },
            "&:nth-of-type(odd)": { backgroundColor: "rgba(147,168,60,0.10) !important" },
            "& td": { color: `${DASHBOARD_COLORS.textPrimary} !important` },
            "& .MuiSvgIcon-root, & .MuiIconButton-root, & .MuiIconButton-root .MuiSvgIcon-root": {
              color: `${DASHBOARD_COLORS.textPrimary} !important`,
            },
            "&.Mui-editingRow, &[data-editing='true']": {
              backgroundColor: "transparent !important",
              "& td": { color: `${DASHBOARD_COLORS.textPrimary} !important` },
            },
            "&.MuiTableBodyRow-root:hover": {
              backgroundColor: "rgba(147,168,60,0.16) !important",
              "& td": { color: `${DASHBOARD_COLORS.textPrimary} !important` },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          body: {
            backgroundColor: "transparent",
            color: DASHBOARD_COLORS.textPrimary,
            borderBottom: `1px solid ${DASHBOARD_COLORS.border}`,
          },
          head: {
            backgroundColor: DASHBOARD_COLORS.cardBg,
            color: DASHBOARD_COLORS.accentStrong,
            fontWeight: 600,
            borderBottom: `2px solid ${DASHBOARD_COLORS.borderStrong}`,
          },
          footer: {
            backgroundColor: DASHBOARD_COLORS.cardBg,
            color: DASHBOARD_COLORS.textPrimary,
          },
        },
      },
    },
  });
