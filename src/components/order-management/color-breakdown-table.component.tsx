import React, { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export interface LocalColorRow {
  colorCode: string;
  description: string;
  allocationWeight: number; // Matches the numerical values for ratios or quantities
}

interface TableProps {
  colors: LocalColorRow[];
  setColors: React.Dispatch<React.SetStateAction<LocalColorRow[]>>;
}

const ColorBreakdownTable = ({ colors, setColors }: TableProps) => {
  const columns = useMemo<MRT_ColumnDef<LocalColorRow>[]>(
    () => [
      {
        accessorKey: "colorCode",
        header: "Colour Code (Max 6)",
        muiEditTextFieldProps: {
          required: true,
          inputProps: { maxLength: 6, style: { textTransform: "uppercase" } },
        },
      },
      {
        accessorKey: "description",
        header: "Colour Description / Shade Name",
        muiEditTextFieldProps: {
          inputProps: { maxLength: 30 },
        },
      },
      {
        accessorKey: "allocationWeight",
        header: "Allocation Weight (Ratio / Pieces)",
        type: "number",
        muiEditTextFieldProps: {
          type: "number",
          required: true,
        },
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: colors,
    editDisplayMode: "row", // Smooth, click-to-edit interface rows
    enableEditing: true,
    enablePagination: false, // Keeps full visibility on continuous matrix rows
    enableBottomToolbar: false,
    getRowId: (row) => row.colorCode,

    onEditingRowSave: ({ values, exitEditingMode }) => {
      const sanitizedValues: LocalColorRow = {
        colorCode: values.colorCode.toUpperCase().trim(),
        description: values.description,
        allocationWeight: Math.max(0, Number(values.allocationWeight) || 0),
      };

      setColors((prev) =>
        prev.map((item) =>
          item.colorCode === sanitizedValues.colorCode ? sanitizedValues : item,
        ),
      );
      exitEditingMode();
    },

    renderTopToolbarCustomActions: () => (
      <Box sx={{ p: 1 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            const rawCode = prompt(
              "Enter New Colour Identifier Code (e.g. WHT, BLK, RED):",
            );
            if (!rawCode) return;

            const cleanCode = rawCode.toUpperCase().trim();
            if (colors.some((c) => c.colorCode === cleanCode)) {
              alert("This color identifier code already exists in your table.");
              return;
            }

            setColors((prev) => [
              ...prev,
              { colorCode: cleanCode, description: "", allocationWeight: 0 },
            ]);
          }}
        >
          Add Product Colour Row
        </Button>
      </Box>
    ),
  });

  return <MaterialReactTable table={table} />;
};

export default ColorBreakdownTable;
