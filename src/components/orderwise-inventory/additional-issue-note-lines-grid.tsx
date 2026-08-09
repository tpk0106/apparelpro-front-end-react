import { useMemo } from "react";
import { TextField, Chip } from "@mui/material";
import type { MRT_ColumnDef } from "material-react-table";
import { MaterialReactTable } from "material-react-table";
import { useApparelProTable } from "../../themes/useApparelProTable";
import type { AinLineItemRow } from "./additional-issue-note.types";

interface AdditionalIssueNoteLinesGridProps {
  lines: AinLineItemRow[];
  setLines: React.Dispatch<React.SetStateAction<AinLineItemRow[]>>;
}

export default function AdditionalIssueNoteLinesGrid({
  lines,
  setLines,
}: AdditionalIssueNoteLinesGridProps) {
  const handleUpdateQuantity = (index: number, rawValue: string) => {
    const quantity = rawValue === "" ? 0 : Number(rawValue);
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity };
      return updated;
    });
  };

  const columns = useMemo<MRT_ColumnDef<AinLineItemRow>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 150 },
      { accessorKey: "description", header: "Description", size: 170 },
      { accessorKey: "storeCode", header: "Basis", size: 80 },
      { accessorKey: "unit", header: "Unit", size: 70 },
      {
        accessorKey: "orderedQuantity",
        header: "Order Qty",
        size: 100,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      {
        accessorKey: "toDateIssued",
        header: "To-Date Issued",
        size: 120,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      {
        accessorKey: "qtyInHand",
        header: "Qty In Hand",
        size: 110,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      {
        accessorKey: "availableForIssue",
        header: "Available",
        size: 110,
        // Filled blue pill with a white ring + white label, matching the "Max
        // Returnable" ceiling badge used on RTN/SRN (goods-return-note-lines-grid.tsx
        // / supplier-return-note-lines-grid.tsx) — same component, same styling, so
        // the ceiling quantity reads consistently across every note type. Flips to
        // the red/error variant when the entered Qty to Issue has gone over it.
        Cell: ({ row }) => {
          const isOverAvailable =
            row.original.quantity > row.original.availableForIssue;
          return (
            <Chip
              size="small"
              variant="filled"
              color={isOverAvailable ? "error" : "primary"}
              label={row.original.availableForIssue.toLocaleString()}
              sx={{
                border: "1px solid #FFFFFF",
                "& .MuiChip-label": { color: "#FFFFFF" },
              }}
            />
          );
        },
      },
      {
        accessorKey: "quantity",
        header: "Qty to Issue",
        size: 130,
        Cell: ({ row }) => {
          const ceiling = row.original.availableForIssue;
          const invalid =
            row.original.quantity < 0 || row.original.quantity > ceiling;
          return (
            <TextField
              type="number"
              size="small"
              variant="standard"
              value={row.original.quantity}
              error={invalid}
              onChange={(e) =>
                handleUpdateQuantity(row.index, e.target.value)
              }
              slotProps={{
                htmlInput: {
                  min: 0,
                  max: ceiling,
                  style: { fontFamily: '"JetBrains Mono", monospace' },
                },
              }}
              sx={{ width: 100 }}
            />
          );
        },
      },
    ],
    [],
  );

  const table = useApparelProTable<AinLineItemRow>({
    columns,
    data: lines,
    enableEditing: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enablePagination: false,
    enableBottomToolbar: false,
    enableTopToolbar: false,
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        backgroundColor:
          row.original.quantity > row.original.availableForIssue ||
          row.original.quantity < 0
            ? "rgba(248,113,113,0.12) !important"
            : row.original.quantity > 0
              ? "rgba(96,165,250,0.06) !important"
              : undefined,
      },
    }),
    initialState: { density: "compact" },
  });

  return <MaterialReactTable table={table} />;
}
