// src/components/common/useApparelProTable.ts
import {
  useMaterialReactTable,
  type MRT_RowData,
  type MRT_TableOptions,
} from "material-react-table";

export function useApparelProTable<TData extends MRT_RowData>(
  options: Partial<MRT_TableOptions<TData>> &
    Pick<MRT_TableOptions<TData>, "columns" | "data">,
) {
  return useMaterialReactTable({
    ...options,
    enableEditing: options.enableEditing ?? true,
    editDisplayMode: options.editDisplayMode ?? "row",

    // 1. TOP TOOLBAR: Sky Blue
    muiTopToolbarProps: {
      sx: {
        backgroundColor: "#60a5fa !important",
        boxShadow: "0px 0px 20px rgba(0,0,0,.5) !important",
        "& .MuiIconButton-root, & .MuiSvgIcon-root": {
          color: "#000000 !important",
        },
      },
    },

    // 2. DATA ROWS: Alternating Blue / White Edit states
    muiTableBodyRowProps: ({ row, table }) => {
      const isEditing = table.getState().editingRow?.id === row.id;
      const isCreating = table.getState().creatingRow;
      const anyRowEditing = !!table.getState().editingRow;
      const isRowEven = Number(row?.id) % 2 === 0;

      return {
        hover: !anyRowEditing,
        sx: {
          opacity: !anyRowEditing || isEditing || isCreating ? 1 : 0.4,
          transition: "all 0.15s ease-in-out",

          // Alternate row backgrounds cleanly
          backgroundColor: isEditing
            ? "#FFFFFF !important"
            : isRowEven
              ? "#4B9CD3 !important"
              : "#7CB9E8 !important",

          "& td": {
            color: "#000000 !important",
            borderColor: "rgba(0, 0, 0, 0.1) !important",
          },

          // Force all icons to be uniform purple
          "& .MuiSvgIcon-root, & .MuiIconButton-root": {
            color: "#A855F7 !important",
          },

          // Hover configurations over row elements
          "&:hover td": {
            borderTop: "1px solid #FFFFFF !important",
            borderBottom: "1px solid #FFFFFF !important",
            color: "#4B9CD3 !important",
            backgroundColor:
              isEditing || isCreating
                ? "#FFFFFF !important"
                : "#000000 !important",
            "& .MuiSvgIcon-root, & .MuiIconButton-root": {
              color:
                isEditing || isCreating
                  ? "#4169E1 !important"
                  : "#4169E1 !important",
            },
          },
        },
      };
    },

    // 3. TABLE COLUMN SUMMARY FOOTER ROW: Sky Blue
    muiTableFooterRowProps: {
      sx: {
        backgroundColor: "#60a5fa !important",
        borderTop: "1px solid rgba(0, 0, 0, 0.1) !important",
        "& td": {
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: "600",
          color: "#000000 !important",
        },
      },
    },

    // 4. 🚀 THE COMPLETE FIXED BOTTOM PAGINATION WORKSPACE PANELS
    muiBottomToolbarProps: {
      sx: {
        backgroundColor: "#60a5fa !important",
        boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.5) !important",
        borderTop: "1px solid rgba(0, 0, 0, 0.1) !important",
        backgroundImage: "none !important",

        // Force overall toolbar text, labels, and paragraph fields to turn solid black
        "&, & p, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
          {
            color: "#000000 !important",
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: "600 !important",
          },

        // Force navigation pagination arrow buttons (Next, Prev, First, Last) to turn crisp black
        "& .MuiIconButton-root, & .MuiSvgIcon-root": {
          color: "#000000 !important",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.08) !important",
          },
          "&.Mui-disabled": {
            color: "rgba(0, 0, 0, 0.25) !important",
          },
        },
      },
    },

    // 5. 🚀 FIXED CASING: MATCHES THE TYPING EXPECTATION FROM YOUR ERROR LOG
    muiPaginationProps: {
      SelectProps: {
        sx: {
          color: "#000000 !important", // Selected value turns crisp black
          fontWeight: "600 !important",
          "& .MuiSvgIcon-root": {
            color: "#000000 !important", // Dropdown arrow turns black
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.3) !important",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000000 !important",
          },
        },
        // STYLE THE DETACHED FLOATING POPUP SELECTION LAYER (Solid Black & White, No Transparency)
        MenuProps: {
          slotProps: {
            paper: {
              sx: {
                backgroundColor: "#000000 !important", // Solid black container background
                border: "1px solid rgba(255, 255, 255, 0.15) !important",
                boxShadow: "0px 10px 30px rgba(0,0,0,0.8) !important",
                backgroundImage: "none !important",
                opacity: "1 !important", // Zero transparency leaks

                "& .MuiMenuItem-root": {
                  color: "#FFFFFF !important", // Sharp white text options
                  fontFamily: '"Inter", sans-serif',
                  fontSize: "0.8rem",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1) !important",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#60a5fa !important", // Active row number selection is sky blue
                    color: "#000000 !important", // Text inverts to black for perfect contrast
                    "&:hover": {
                      backgroundColor: "#60a5fa !important",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}
