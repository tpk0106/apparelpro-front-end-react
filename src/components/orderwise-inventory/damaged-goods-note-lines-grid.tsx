import { useMemo } from "react";
import { TextField, Chip, IconButton } from "@mui/material";
import type { MRT_ColumnDef } from "material-react-table";
import { MaterialReactTable } from "material-react-table";
import DeleteIcon from "@mui/icons-material/Delete";
import { useApparelProTable } from "../../themes/useApparelProTable";
import type { DgnLineItemRow } from "./damaged-goods-note.types";

interface DamagedGoodsNoteLinesGridProps {
  lines: DgnLineItemRow[];
  setLines: React.Dispatch<React.SetStateAction<DgnLineItemRow[]>>;
}

// Row-derived, read-only figure — recomputed on every render, never stored in state.
// The hard ceiling is QtyInHand at lookup time — this is a soft client-side warning
// only; the hard block always happens on the server (CommitDamagedGoodsNoteAsync —
// "Attempt to Exceed Balance Quantity").
interface DgnLineItemRowView extends DgnLineItemRow {
  isOverDamageable: boolean;
}

export default function DamagedGoodsNoteLinesGrid({
  lines,
  setLines,
}: DamagedGoodsNoteLinesGridProps) {
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

  const rows = useMemo<DgnLineItemRowView[]>(
    () =>
      lines.map((line) => ({
        ...line,
        isOverDamageable: Number(line.quantity || 0) > line.maxDamageableQuantity,
      })),
    [lines],
  );

  const columns = useMemo<MRT_ColumnDef<DgnLineItemRowView>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 150 },
      { accessorKey: "description", header: "Description", size: 170 },
      { accessorKey: "storeCode", header: "Basis", size: 80 },
      { accessorKey: "unit", header: "Unit", size: 70 },
      {
        accessorKey: "qtyInHand",
        header: "Qty In Hand",
        size: 120,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      {
        accessorKey: "quantity",
        header: "Damage Qty",
        size: 130,
        Cell: ({ row }) => (
          <TextField
            type="number"
            size="small"
            variant="standard"
            value={row.original.quantity}
            error={row.original.isOverDamageable}
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
        id: "damageableCeiling",
        header: "Max Damageable",
        size: 130,
        Cell: ({ row }) => (
          <Chip
            size="small"
            variant="filled"
            color={row.original.isOverDamageable ? "error" : "primary"}
            label={row.original.maxDamageableQuantity.toLocaleString()}
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

  const table = useApparelProTable<DgnLineItemRowView>({
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
        backgroundColor: row.original.isOverDamageable
          ? "rgba(248,113,113,0.12) !important"
          : undefined,
      },
    }),
    initialState: { density: "compact" },
  });

  return <MaterialReactTable table={table} />;
}
