import { createTheme, type Theme } from "@mui/material";

// The app-wide theme skins MuiTableRow/MuiTableCell for Material React
// Table grids (forced blue zebra rows, !important black cell text, blue
// header fill) - works there, but makes a plain reporting <Table> nearly
// unreadable (e.g. a muted "Cum:" sub-line loses almost all contrast
// against the forced blue row background). This targets the exact same
// styleOverrides keys the app-wide theme sets, so createTheme's merge
// replaces those specific values for any table wrapped in this theme,
// rather than fighting a CSS specificity/!important war.
export const withReadableReportTable = (outerTheme: Theme) =>
  createTheme(outerTheme, {
    components: {
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: "none",
            "&:nth-of-type(even)": { backgroundColor: "transparent !important" },
            "&:nth-of-type(odd)": { backgroundColor: "rgba(255,255,255,0.04) !important" },
            "& td": { color: "#F4F6F8 !important" },
            "& .MuiSvgIcon-root, & .MuiIconButton-root, & .MuiIconButton-root .MuiSvgIcon-root": {
              color: "#F4F6F8 !important",
            },
            "&.Mui-editingRow, &[data-editing='true']": {
              backgroundColor: "transparent !important",
              "& td": { color: "#F4F6F8 !important" },
            },
            "&.MuiTableBodyRow-root:hover": {
              backgroundColor: "rgba(255,255,255,0.07) !important",
              "& td": { color: "#F4F6F8 !important" },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          body: {
            backgroundColor: "transparent",
            color: "#F4F6F8",
          },
          head: {
            backgroundColor: "#20242C",
            color: "#F4F6F8",
            borderBottom: "2px solid rgba(244,246,248,0.2)",
          },
          footer: {
            backgroundColor: "#20242C",
            color: "#F4F6F8",
          },
        },
      },
    },
  });
