import { useMemo } from "react";
import { TextField, Chip, IconButton } from "@mui/material";
import type { MRT_ColumnDef } from "material-react-table";
import { MaterialReactTable } from "material-react-table";
import DeleteIcon from "@mui/icons-material/Delete";
import { useApparelProTable } from "../../themes/useApparelProTable";
import type { GinLineItemRow } from "./goods-issue-note.types";

interface GoodsIssueNoteLinesGridProps {
  lines: GinLineItemRow[];
  setLines: React.Dispatch<React.SetStateAction<GinLineItemRow[]>>;
}

// Row-derived, read-only figures — recomputed on every render, never stored in state.
// availableToIssue mirrors the same ceiling CommitGoodsIssueNoteAsync enforces server-side
// (STRN balance AND physical qty-in-hand, whichever is tighter). This is a soft client-side
// warning only; the hard block always happens on the server.
interface GinLineItemRowView extends GinLineItemRow {
  availableToIssue: number;
  isOverBalance: boolean;
}

export default function GoodsIssueNoteLinesGrid({
  lines,
  setLines,
}: GoodsIssueNoteLinesGridProps) {
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

  const rows = useMemo<GinLineItemRowView[]>(
    () =>
      lines.map((line) => {
        const availableToIssue = Math.min(line.balanceToReceive, line.qtyInHand);
        const quantity = Number(line.quantity || 0);
        return {
          ...line,
          availableToIssue,
          isOverBalance: quantity > availableToIssue,
        };
      }),
    [lines],
  );

  const columns = useMemo<MRT_ColumnDef<GinLineItemRowView>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 130 },
      { accessorKey: "storeCode", header: "Basis", size: 80 },
      { accessorKey: "unit", header: "Unit", size: 80 },
      {
        accessorKey: "balanceToReceive",
        header: "STRN Balance",
        size: 120,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      {
        accessorKey: "qtyInHand",
        header: "Qty In Hand",
        size: 120,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      {
        accessorKey: "quantity",
        header: "Issue Qty",
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
        accessorKey: "availableToIssue",
        header: "Available",
        size: 110,
        Cell: ({ row }) => (
          <Chip
            size="small"
            variant={row.original.isOverBalance ? "filled" : "outlined"}
            color={row.original.isOverBalance ? "error" : "default"}
            label={row.original.availableToIssue.toLocaleString()}
          />
        ),
      },
    ],
    [],
  );

  const table = useApparelProTable<GinLineItemRowView>({
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
