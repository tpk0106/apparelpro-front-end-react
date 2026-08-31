// src/components/common/useApparelProTable.ts
import {
  useMaterialReactTable,
  type MRT_RowData,
  type MRT_TableOptions,
} from "material-react-table";
import type { TableColorTheme } from "./table-color-themes";
import { getTableColorTheme, DEFAULT_TABLE_THEME_ID } from "./table-theme-registry";

export function useApparelProTable<TData extends MRT_RowData>(
  options: Partial<MRT_TableOptions<TData>> &
    Pick<MRT_TableOptions<TData>, "columns" | "data"> & {
      // Optional palette override - omit to use the app-wide default (see
      // table-theme-registry.ts). Pass a named theme (see table-color-themes.ts)
      // to opt a single table into a different palette without affecting any other.
      colorTheme?: TableColorTheme;
    },
) {
  const { colorTheme, ...tableOptions } = options;
  const c = colorTheme ?? getTableColorTheme(DEFAULT_TABLE_THEME_ID);

  return useMaterialReactTable({
    // 1. Pass down individual data configurations
    ...tableOptions,

    // 2. Lock the global edit display mode
    enableEditing: tableOptions.enableEditing ?? true,
    editDisplayMode: tableOptions.editDisplayMode ?? "row",

    // 3. GLOBAL HEADER TOOLBAR
    muiTopToolbarProps: {
      sx: {
        "&&&": {
          backgroundColor: `${c.headerBg} !important`,
          boxShadow: "0px 0px 20px rgba(0,0,0,.5) !important",
          "& .MuiIconButton-root, & .MuiSvgIcon-root": {
            color: `${c.headerIconColor} !important`,
          },
          // The "+ New X" button every table renders itself via
          // renderTopToolbarCustomActions - themed centrally here instead of
          // needing every one of those ~38 call sites to set its own sx.
          ...(c.createButtonSx
            ? { "& .MuiButton-contained": c.createButtonSx as Record<string, unknown> }
            : {}),
        },
      },
    },

    // 3b. COLUMN HEADER CELLS - the app-wide theme (themes.ts) forces its own
    // sky-blue MuiTableCell "head" variant with !important; this is the
    // per-instance override so a table's own colorTheme actually reaches the
    // header row instead of falling back to the global blue. Merges any
    // caller-supplied muiTableHeadCellProps (e.g. GRN listing's whiteSpace
    // tweak) instead of discarding it.
    muiTableHeadCellProps: (params) => {
      const custom =
        typeof tableOptions.muiTableHeadCellProps === "function"
          ? tableOptions.muiTableHeadCellProps(params)
          : (tableOptions.muiTableHeadCellProps ?? {});
      return {
        ...custom,
        sx: {
          backgroundColor: `${c.headerBg} !important`,
          color: `${c.headerText} !important`,
          "& .MuiSvgIcon-root, & .MuiIconButton-root": {
            color: `${c.headerIconColor} !important`,
          },
          ...(custom.sx as Record<string, unknown> | undefined),
        },
      };
    },

    // 4. GLOBAL ODD/EVEN/EDIT ROW STATE LOCK
    // Merges any caller-supplied muiTableBodyRowProps (e.g. onClick-to-select,
    // a highlight sx for a selected row) with the shared default row styling
    // below, instead of silently discarding it. Callers that don't pass their
    // own muiTableBodyRowProps see byte-identical behavior to before - this
    // does not change the existing theme, it only makes it extensible.
    muiTableBodyRowProps: (params) => {
      const { row, table } = params;
      const custom =
        typeof tableOptions.muiTableBodyRowProps === "function"
          ? tableOptions.muiTableBodyRowProps(params)
          : (tableOptions.muiTableBodyRowProps ?? {});

      const isEditing = table.getState().editingRow?.id === row.id;
      // table.getState().creatingRow is table-global (true while *any* row is
      // being created), not row-specific - only the row MRT actually renders
      // as the create form should be treated as edit-mode-styled, otherwise
      // every other row would wrongly flip to editBg while a new row is open.
      const isThisRowCreating = table.getState().creatingRow?.id === row.id;
      const anyRowEditing = !!table.getState().editingRow;
      const isRowEven = Number(row?.id) % 2 === 0;
      const isEditModeRow = isEditing || isThisRowCreating;

      return {
        hover: !anyRowEditing,
        ...custom,
        sx: {
          // "&&&" (the class repeated three times) outranks themes.ts's global
          // MuiTableRow override, which uses compound selectors like
          // "&:nth-of-type(even)" and "&.Mui-editingRow" - those carry higher
          // CSS specificity than a plain single-class sx override, so without
          // this the theme's hardcoded blue silently wins regardless of
          // colorTheme. This was invisible before because the default palette
          // happened to match those hardcoded colors.
          "&&&": {
            opacity: !anyRowEditing || isEditModeRow ? 1 : 0.4,
            transition: "all 0.15s ease-in-out",

            // Alternate row backgrounds cleanly
            backgroundColor: isEditModeRow
              ? `${c.editBg} !important`
              : isRowEven
                ? `${c.rowAltBg} !important`
                : `${c.rowBg} !important`,

            "& td": {
              color: isEditModeRow ? `${c.editText} !important` : `${c.rowText} !important`,
              borderColor: `${c.rowBorder} !important`,
            },
            borderTop: `1px solid ${c.rowBorder} !important`,
            borderBottom: `1px solid ${c.rowBorder} !important`,

            // Force all icons to be uniform. Edit-mode uses its own icon
            // color regardless of hover, since editBg can be a light surface
            // where rowIconColor/rowHoverIconColor would wash out or vanish.
            "& .MuiSvgIcon-root, & .MuiIconButton-root": {
              color: `${isEditModeRow ? c.editIconColor : c.rowIconColor} !important`,
            },

            // Edit-mode input text - this must apply whether or not the row is
            // hovered (previously only the ":hover td" branch below forced this,
            // so an editing row's text field was only readable while the cursor
            // sat over it and went invisible/unstyled the instant it moved away).
            ...(isEditModeRow
              ? {
                  "& .MuiInputBase-input, & .MuiOutlinedInput-input, & .MuiSelect-select": {
                    color: `${c.editText} !important`,
                    WebkitTextFillColor: `${c.editText} !important`,
                    caretColor: `${c.editText} !important`,
                  },
                  "& .MuiInput-underline:before, & .MuiInput-underline:after, & .MuiInputBase-root:before, & .MuiInputBase-root:after":
                    {
                      borderColor: `${c.editText} !important`,
                    },
                }
              : {}),

            // Hover configurations over row elements
            "&:hover td": {
              borderTop: `1px solid ${c.rowHoverBorder} !important`,
              borderBottom: `1px solid ${c.rowHoverBorder} !important`,
              color: `${isEditModeRow ? c.editText : c.rowHoverText} !important`,
              backgroundColor: isEditModeRow
                ? `${c.editBg} !important`
                : `${c.rowHoverBg} !important`,

              "& .MuiSvgIcon-root, & .MuiIconButton-root": {
                color: `${isEditModeRow ? c.editIconColor : c.rowHoverIconColor} !important`,
              },
              // The hover background above swallows inline-editable cells
              // (TextField/select rendered directly in a column Cell, as opposed
              // to MRT's built-in row-edit mode) - their input text/underline
              // otherwise stays MUI's default dark color and becomes unreadable
              // against the hover background. Force those to stay legible on hover.
              "& .MuiInputBase-input, & .MuiSelect-select": {
                color: isEditModeRow ? `${c.editText} !important` : `${c.rowHoverText} !important`,
                caretColor: isEditModeRow ? `${c.editText} !important` : `${c.rowHoverText} !important`,
              },
              "& .MuiInput-underline:before, & .MuiInput-underline:after, & .MuiInputBase-root:before, & .MuiInputBase-root:after":
                {
                  borderColor: isEditModeRow ? `${c.editText} !important` : `${c.rowHoverText} !important`,
                },
            },
          },

          // Caller's own sx (e.g. a selected-row highlight) wins last
          ...(custom.sx as Record<string, unknown> | undefined),
        },
      };
    },

    // 3. TABLE COLUMN SUMMARY FOOTER ROW
    muiTableFooterRowProps: {
      sx: {
        backgroundColor: `${c.footerBg} !important`,
        borderTop: `1px solid ${c.rowBorder} !important`,
        "& td": {
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: "600",
          color: `${c.footerText} !important`,
        },
      },
    },

    // 4. BOTTOM PAGINATION WORKSPACE PANEL
    muiBottomToolbarProps: {
      sx: {
        backgroundColor: `${c.paginationBg} !important`,
        boxShadow: "0px 0px 20px rgba(0,0,0,.5) !important",
        borderTop: `1px solid ${c.rowBorder} !important`,
        backgroundImage: "none !important", // Clears out dark theme altitude gradient overlays

        // Force all pagination dropdowns, page counts text, and select labels to match the theme
        "&, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows, & .MuiTablePagination-select, & .MuiInputBase-root":
          {
            color: `${c.paginationText} !important`,
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: "600",
          },

        // Force navigation pagination arrow buttons (Next, Prev, First, Last) to match the theme
        "& .MuiIconButton-root, & .MuiSvgIcon-root": {
          color: `${c.paginationText} !important`,
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.08) !important",
          },
          "&.Mui-disabled": {
            color: `${c.paginationText} !important`,
            opacity: "0.3 !important",
          },
        },

        // "Rows per page" label - optional accent, separate from the general
        // pagination text color above (e.g. copper on the olive theme).
        ...(c.paginationLabelColor
          ? {
              "& .MuiFormLabel-root, & .MuiInputLabel-root": {
                color: `${c.paginationLabelColor} !important`,
              },
            }
          : {}),

        // Selected page-number button - optional full sx override (e.g. the
        // copper gloss treatment). Shape/size stay whatever muiPaginationProps
        // already set on the caller's Pagination component; this only touches
        // color/background/shadow.
        ...(c.paginationSelectedSx
          ? {
              "& .MuiPaginationItem-root.Mui-selected": c.paginationSelectedSx as Record<string, unknown>,
            }
          : {}),
      },
    },
  });
}
