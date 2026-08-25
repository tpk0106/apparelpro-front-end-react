import { useMemo } from "react";
import { TextField, Chip, IconButton } from "@mui/material";
import type { MRT_ColumnDef } from "material-react-table";
import { MaterialReactTable } from "material-react-table";
import DeleteIcon from "@mui/icons-material/Delete";
import { useApparelProTable } from "../../themes/useApparelProTable";
import type { GeneralGrnLineItemRow } from "../../interfaces/general-inventory/general-grn.types";

interface GoodsReceivedNoteLinesGridProps {
  lines: GeneralGrnLineItemRow[];
  setLines: React.Dispatch<React.SetStateAction<GeneralGrnLineItemRow[]>>;
}

// Row-derived, read-only figures - recomputed on every render, never stored in state.
// exceedsMaxStock mirrors the server's soft max-stock warning (QtyInHand + qty > MaxStock)
// as a courtesy; the authoritative check always happens server-side.
interface GrnLineItemRowView extends GeneralGrnLineItemRow {
  exceedsMaxStock: boolean;
}

export default function GoodsReceivedNoteLinesGrid({
  lines,
  setLines,
}: GoodsReceivedNoteLinesGridProps) {
  const handleUpdateField = (
    index: number,
    field: "quantity" | "price",
    rawValue: string,
  ) => {
    const value = rawValue === "" ? 0 : Number(rawValue);
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
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
          exceedsMaxStock: line.qtyInHand + quantity > line.maxStock,
        };
      }),
    [lines],
  );

  const columns = useMemo<MRT_ColumnDef<GrnLineItemRowView>[]>(
    () => [
      { accessorKey: "storeCode", header: "Store", size: 80 },
      { accessorKey: "itemCode", header: "Item Code", size: 130 },
      { accessorKey: "description", header: "Description", size: 190 },
      { accessorKey: "unit", header: "Unit", size: 70 },
      {
        accessorKey: "qtyInHand",
        header: "Qty In Hand",
        size: 110,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      {
        accessorKey: "quantity",
        header: "Receive Qty",
        size: 120,
        Cell: ({ row }) => (
          <TextField
            type="number"
            size="small"
            variant="standard"
            value={row.original.quantity}
            error={row.original.exceedsMaxStock}
            onChange={(e) => handleUpdateField(row.index, "quantity", e.target.value)}
            slotProps={{
              htmlInput: { min: 0, style: { fontFamily: '"JetBrains Mono", monospace' } },
            }}
            sx={{ width: 100 }}
          />
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        size: 110,
        Cell: ({ row }) => (
          <TextField
            type="number"
            size="small"
            variant="standard"
            value={row.original.price}
            onChange={(e) => handleUpdateField(row.index, "price", e.target.value)}
            slotProps={{
              htmlInput: { min: 0, step: "0.0001", style: { fontFamily: '"JetBrains Mono", monospace' } },
            }}
            sx={{ width: 100 }}
          />
        ),
      },
      {
        id: "maxStockFlag",
        header: "Max Stock",
        size: 110,
        Cell: ({ row }) => (
          <Chip
            size="small"
            variant="filled"
            color={row.original.exceedsMaxStock ? "error" : "primary"}
            label={row.original.maxStock.toLocaleString()}
            sx={{
              border: "1px solid #FFFFFF",
              "& .MuiChip-label": { color: "#FFFFFF" },
            }}
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
        backgroundColor: row.original.exceedsMaxStock ? "rgba(248,113,113,0.12) !important" : undefined,
      },
    }),
    initialState: { density: "compact" },
  });

  return <MaterialReactTable table={table} />;
}
