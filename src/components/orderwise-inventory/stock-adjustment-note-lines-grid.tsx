import { useMemo } from "react";
import { TextField, Typography } from "@mui/material";
import type { MRT_ColumnDef } from "material-react-table";
import { MaterialReactTable } from "material-react-table";
import { useApparelProTable } from "../../themes/useApparelProTable";
import type { SanLineItemRow } from "./stock-adjustment-note.types";

interface StockAdjustmentNoteLinesGridProps {
  lines: SanLineItemRow[];
  setLines: React.Dispatch<React.SetStateAction<SanLineItemRow[]>>;
}

// Row-derived, read-only figure — recomputed on every render, never stored in state.
// Positive = stock increases as a result of this adjustment, negative = decreases.
// Purely informational: SAN has no ceiling of any kind, unlike every other note.
interface SanLineItemRowView extends SanLineItemRow {
  changeQuantity: number;
}

export default function StockAdjustmentNoteLinesGrid({
  lines,
  setLines,
}: StockAdjustmentNoteLinesGridProps) {
  const handleUpdateAdjustedQuantity = (index: number, rawValue: string) => {
    const adjustedQuantity = rawValue === "" ? 0 : Number(rawValue);
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], adjustedQuantity };
      return updated;
    });
  };

  const rows = useMemo<SanLineItemRowView[]>(
    () =>
      lines.map((line) => ({
        ...line,
        changeQuantity: Number(line.adjustedQuantity || 0) - line.qtyInHand,
      })),
    [lines],
  );

  const columns = useMemo<MRT_ColumnDef<SanLineItemRowView>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 150 },
      { accessorKey: "description", header: "Description", size: 170 },
      { accessorKey: "storeCode", header: "Basis", size: 80 },
      { accessorKey: "unit", header: "Unit", size: 70 },
      {
        accessorKey: "qtyInHand",
        header: "Current Qty",
        size: 110,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      {
        accessorKey: "adjustedQuantity",
        header: "Adjusted Qty",
        size: 130,
        Cell: ({ row }) => (
          <TextField
            type="number"
            size="small"
            variant="standard"
            value={row.original.adjustedQuantity}
            error={row.original.adjustedQuantity < 0}
            onChange={(e) =>
              handleUpdateAdjustedQuantity(row.index, e.target.value)
            }
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
        id: "changeQuantity",
        header: "Change",
        size: 100,
        Cell: ({ row }) => {
          const delta = row.original.changeQuantity;
          if (delta === 0) {
            return (
              <Typography variant="body2" sx={{ color: "#8B93A1" }}>
                —
              </Typography>
            );
          }
          return (
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: delta > 0 ? "#4ADE80" : "#F87171" }}
            >
              {delta > 0 ? "+" : ""}
              {delta.toLocaleString()}
            </Typography>
          );
        },
      },
    ],
    [],
  );

  const table = useApparelProTable<SanLineItemRowView>({
    columns,
    data: rows,
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
          row.original.adjustedQuantity < 0
            ? "rgba(248,113,113,0.12) !important"
            : row.original.changeQuantity !== 0
              ? "rgba(96,165,250,0.06) !important"
              : undefined,
      },
    }),
    initialState: { density: "compact" },
  });

  return <MaterialReactTable table={table} />;
}
