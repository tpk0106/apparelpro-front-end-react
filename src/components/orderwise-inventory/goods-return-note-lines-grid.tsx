import { useMemo } from "react";
import { TextField, Chip, IconButton } from "@mui/material";
import type { MRT_ColumnDef } from "material-react-table";
import { MaterialReactTable } from "material-react-table";
import DeleteIcon from "@mui/icons-material/Delete";
import { useApparelProTable } from "../../themes/useApparelProTable";
import type { RtnLineItemRow } from "./goods-return-note.types";

interface GoodsReturnNoteLinesGridProps {
  lines: RtnLineItemRow[];
  setLines: React.Dispatch<React.SetStateAction<RtnLineItemRow[]>>;
}

// Row-derived, read-only figure — recomputed on every render, never stored in state.
// The hard ceiling is the total quantity issued to date (ToDateIssued) — this is a
// soft client-side warning only; the hard block always happens on the server
// (CommitGoodsReturnNoteAsync — "Return Quantity cannot be greater than Total Issued").
interface RtnLineItemRowView extends RtnLineItemRow {
  isOverReturnable: boolean;
}

export default function GoodsReturnNoteLinesGrid({
  lines,
  setLines,
}: GoodsReturnNoteLinesGridProps) {
  const handleUpdateQuantity = (index: number, rawValue: string) => {
    const quantity = rawValue === "" ? 0 : Number(rawValue);
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity };
      return updated;
    });
  };

  const handleRemoveLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const rows = useMemo<RtnLineItemRowView[]>(
    () =>
      lines.map((line) => {
        const quantity = Number(line.quantity || 0);
        return {
          ...line,
          isOverReturnable: quantity > line.maxReturnableQuantity,
        };
      }),
    [lines],
  );

  const columns = useMemo<MRT_ColumnDef<RtnLineItemRowView>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 150 },
      { accessorKey: "description", header: "Description", size: 170 },
      { accessorKey: "storeCode", header: "Basis", size: 80 },
      { accessorKey: "unit", header: "Unit", size: 70 },
      {
        accessorKey: "qtyInHand",
        header: "Qty In Hand",
        size: 110,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      {
        accessorKey: "maxReturnableQuantity",
        header: "Total Issued",
        size: 110,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      {
        accessorKey: "quantity",
        header: "Return Qty",
        size: 130,
        Cell: ({ row }) => (
          <TextField
            type="number"
            size="small"
            variant="standard"
            value={row.original.quantity}
            error={row.original.isOverReturnable}
            onChange={(e) => handleUpdateQuantity(row.index, e.target.value)}
            slotProps={{
              htmlInput: {
                min: 0,
                style: { fontFamily: '"JetBrains Mono", monospace' },
              },
            }}
            sx={{ width: 100 }}
          />
        ),
      },
      {
        id: "returnableCeiling",
        header: "Max Returnable",
        size: 120,
        Cell: ({ row }) => (
          <Chip
            size="small"
            variant={row.original.isOverReturnable ? "filled" : "outlined"}
            color={row.original.isOverReturnable ? "error" : "default"}
            label={row.original.maxReturnableQuantity.toLocaleString()}
            sx={{
              // Default chip text otherwise inherits the theme's black text.primary,
              // which is invisible against this dark table — hardcode explicit colors
              // (same fix pattern as the STRN/Stock Movement report tiles).
              color: "#F4F6F8",
              borderColor: "#8B93A1",
              "& .MuiChip-label": { color: "#F4F6F8" },
              transition: "background-color 0.15s ease, color 0.15s ease",
              "&:hover": {
                backgroundColor: "#60a5fa",
                borderColor: "#60a5fa",
                "& .MuiChip-label": { color: "#FFFFFF" },
              },
            }}
          />
        ),
      },
    ],
    [],
  );

  const table = useApparelProTable<RtnLineItemRowView>({
    columns,
    data: rows,
    enableEditing: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enablePagination: false,
    enableBottomToolbar: false,
    enableTopToolbar: false,
    enableRowActions: true,
    positionActionsColumn: "last",
    displayColumnDefOptions: {
      "mrt-row-actions": { header: "Action", size: 70 },
    },
    renderRowActions: ({ row }) => (
      <IconButton
        color="error"
        size="small"
        onClick={() => handleRemoveLine(row.index)}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    ),
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        backgroundColor: row.original.isOverReturnable
          ? "rgba(248,113,113,0.12) !important"
          : undefined,
      },
    }),
    initialState: { density: "compact" },
  });

  return <MaterialReactTable table={table} />;
}
