import { useMemo } from "react";
import { TextField, Chip, IconButton } from "@mui/material";
import type { MRT_ColumnDef } from "material-react-table";
import { MaterialReactTable } from "material-react-table";
import DeleteIcon from "@mui/icons-material/Delete";
import { useApparelProTable } from "../../themes/useApparelProTable";
import type { GrnLineItemRow } from "./goods-received-note.types";

interface GoodsReceivedNoteLinesGridProps {
  lines: GrnLineItemRow[];
  setLines: React.Dispatch<React.SetStateAction<GrnLineItemRow[]>>;
}

// Row-derived, read-only figures — recomputed on every render, never stored in state.
// Unlike GIN, the receive ceiling is just the outstanding PO balance — receiving stock
// increases qtyInHand, it isn't capped by it. This is a soft client-side warning only;
// the hard block always happens on the server (CommitGoodsReceivedNoteAsync).
interface GrnLineItemRowView extends GrnLineItemRow {
  isOverBalance: boolean;
}

export default function GoodsReceivedNoteLinesGrid({
  lines,
  setLines,
}: GoodsReceivedNoteLinesGridProps) {
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

  const rows = useMemo<GrnLineItemRowView[]>(
    () =>
      lines.map((line) => {
        const quantity = Number(line.quantity || 0);
        return {
          ...line,
          isOverBalance: quantity > line.balance,
        };
      }),
    [lines],
  );

  const columns = useMemo<MRT_ColumnDef<GrnLineItemRowView>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 130 },
      { accessorKey: "unit", header: "Unit", size: 80 },
      {
        accessorKey: "orderQuantity",
        header: "Order Qty",
        size: 110,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      {
        accessorKey: "balance",
        header: "Outstanding",
        size: 110,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      {
        accessorKey: "qtyInHand",
        header: "Qty In Hand",
        size: 110,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      {
        accessorKey: "quantity",
        header: "Receive Qty",
        size: 130,
        Cell: ({ row }) => (
          <TextField
            type="number"
            size="small"
            variant="standard"
            value={row.original.quantity === 0 ? "" : row.original.quantity}
            error={row.original.isOverBalance}
            onChange={(e) => handleUpdateQuantity(row.index, e.target.value)}
            slotProps={{
              htmlInput: { min: 0, style: { fontFamily: '"JetBrains Mono", monospace' } },
            }}
            sx={{ width: 100 }}
          />
        ),
      },
      {
        id: "availableToReceive",
        header: "Available",
        size: 110,
        Cell: ({ row }) => (
          <Chip
            size="small"
            variant={row.original.isOverBalance ? "filled" : "outlined"}
            color={row.original.isOverBalance ? "error" : "default"}
            label={row.original.balance.toLocaleString()}
          />
        ),
      },
    ],
    [],
  );

  const table = useApparelProTable<GrnLineItemRowView>({
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
      <IconButton color="error" size="small" onClick={() => handleRemoveLine(row.index)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    ),
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        backgroundColor: row.original.isOverBalance ? "rgba(248,113,113,0.12) !important" : undefined,
      },
    }),
    initialState: { density: "compact" },
  });

  return <MaterialReactTable table={table} />;
}
