import { useMemo } from "react";
import { TextField, Chip, IconButton } from "@mui/material";
import type { MRT_ColumnDef } from "material-react-table";
import { MaterialReactTable } from "material-react-table";
import DeleteIcon from "@mui/icons-material/Delete";
import { useApparelProTable } from "../../themes/useApparelProTable";
import type { GtnLineItemRow } from "./goods-transfer-note.types";

interface GoodsTransferNoteLinesGridProps {
  lines: GtnLineItemRow[];
  setLines: React.Dispatch<React.SetStateAction<GtnLineItemRow[]>>;
}

// Row-derived, read-only figure — recomputed on every render, never stored in state.
// The hard ceiling is the From-side QtyInHand at lookup time — this is a soft
// client-side warning only; the hard block always happens on the server
// (CommitGoodsTransferNoteAsync — "Attempt to Exceed Balance Quantity").
interface GtnLineItemRowView extends GtnLineItemRow {
  isOverTransferable: boolean;
}

export default function GoodsTransferNoteLinesGrid({
  lines,
  setLines,
}: GoodsTransferNoteLinesGridProps) {
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

  const rows = useMemo<GtnLineItemRowView[]>(
    () =>
      lines.map((line) => {
        const quantity = Number(line.quantity || 0);
        return {
          ...line,
          isOverTransferable: quantity > line.maxTransferableQuantity,
        };
      }),
    [lines],
  );

  const columns = useMemo<MRT_ColumnDef<GtnLineItemRowView>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 150 },
      { accessorKey: "description", header: "Description", size: 170 },
      { accessorKey: "storeCode", header: "Basis", size: 80 },
      { accessorKey: "unit", header: "Unit", size: 70 },
      {
        accessorKey: "qtyInHand",
        header: "Qty In Hand (From)",
        size: 130,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      {
        accessorKey: "quantity",
        header: "Transfer Qty",
        size: 130,
        Cell: ({ row }) => (
          <TextField
            type="number"
            size="small"
            variant="standard"
            value={row.original.quantity}
            error={row.original.isOverTransferable}
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
        id: "transferableCeiling",
        header: "Max Transferable",
        size: 130,
        Cell: ({ row }) => (
          <Chip
            size="small"
            variant="filled"
            color={row.original.isOverTransferable ? "error" : "primary"}
            label={row.original.maxTransferableQuantity.toLocaleString()}
            sx={{
              // Always filled (not just on hover) so the max-transferable qty is
              // legible at a glance; red still flags an over-transferable line.
              // White ring makes the pill pop against the row's own blue tones.
              border: "1px solid #FFFFFF",
              "& .MuiChip-label": { color: "#FFFFFF" },
            }}
          />
        ),
      },
    ],
    [],
  );

  const table = useApparelProTable<GtnLineItemRowView>({
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
        backgroundColor: row.original.isOverTransferable
          ? "rgba(248,113,113,0.12) !important"
          : undefined,
      },
    }),
    initialState: { density: "compact" },
  });

  return <MaterialReactTable table={table} />;
}
