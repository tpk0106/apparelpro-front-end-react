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
    // 1. Pass down individual data configurations
    ...options,

    // 2. Lock the global edit display mode
    enableEditing: options.enableEditing ?? true,
    editDisplayMode: options.editDisplayMode ?? "row",

    // 3. GLOBAL SKY BLUE HEADER ACTION
    muiTopToolbarProps: {
      sx: {
        backgroundColor: "#60a5fa !important",
        boxShadow: "0px 0px 20px rgba(0,0,0,.5) !important",
        "& .MuiIconButton-root, & .MuiSvgIcon-root": {
          //   color: "#000000 !important", // High contrast black icons on sky blue
          color: "#ffffff !important", // High contrast black icons on sky blue
        },
      },
    },

    // 4. GLOBAL ODD/EVEN/EDIT ROW STATE LOCK
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
          color: "#000000 !important", // High contrast black text on sky blue
        },
      },
    },

    // 4. 🚀 THE CRITICAL FIX: BOTTOM PAGINATION WORKSPACE PANELS (Sky Blue)
    muiBottomToolbarProps: {
      sx: {
        backgroundColor: "#60a5fa !important",
        boxShadow: "0px 0px 20px rgba(0,0,0,.5) !important",
        borderTop: "1px solid rgba(0, 0, 0, 0.1) !important",
        backgroundImage: "none !important", // Clears out dark theme altitude gradient overlays

        // Force all pagination dropdowns, page counts text, and select labels to turn high-visibility black
        "&, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows, & .MuiTablePagination-select, & .MuiInputBase-root":
          {
            color: "#000000 !important",
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: "600",
          },

        // Force navigation pagination arrow buttons (Next, Prev, First, Last) to turn crisp black
        "& .MuiIconButton-root, & .MuiSvgIcon-root": {
          color: "#000000 !important",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.08) !important",
          },
          "&.Mui-disabled": {
            color: "rgba(0, 0, 0, 0.25) !important", // Legible dark disabled state
          },
        },
      },
    },
  });
}
