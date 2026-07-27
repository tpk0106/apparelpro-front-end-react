import { useMemo } from "react";
import { TextField, Chip, IconButton, Typography } from "@mui/material";
import type { MRT_ColumnDef } from "material-react-table";
import { MaterialReactTable } from "material-react-table";
import DeleteIcon from "@mui/icons-material/Delete";
import { useApparelProTable } from "../../themes/useApparelProTable";
import type { SrnLineItemRow } from "./supplier-return-note.types";

interface SupplierReturnNoteLinesGridProps {
  lines: SrnLineItemRow[];
  setLines: React.Dispatch<React.SetStateAction<SrnLineItemRow[]>>;
}

// Row-derived, read-only figure — recomputed on every render, never stored in state.
// The hard ceiling is QtyInHand at lookup time — this is a soft client-side warning
// only; the hard block always happens on the server (CommitSupplierReturnNoteAsync —
// "Attempt to Exceed Balance Quantity").
interface SrnLineItemRowView extends SrnLineItemRow {
  isOverReturnable: boolean;
  requisitionShortfall: number; // > 0 means this return would deepen (or create) an
                                 // allocation deficit against open Stores Requisition
                                 // Notes. Advisory only — never disables Confirm.
}

export default function SupplierReturnNoteLinesGrid({
  lines,
  setLines,
}: SupplierReturnNoteLinesGridProps) {
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

  const rows = useMemo<SrnLineItemRowView[]>(
    () =>
      lines.map((line) => {
        const quantity = Number(line.quantity || 0);
        const projectedNetAvailable =
          line.netAvailableAfterOutstandingRequisitions - quantity;
        return {
          ...line,
          isOverReturnable: quantity > line.maxReturnableQuantity,
          requisitionShortfall: projectedNetAvailable < 0 ? -projectedNetAvailable : 0,
        };
      }),
    [lines],
  );

  const columns = useMemo<MRT_ColumnDef<SrnLineItemRowView>[]>(
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
        size: 130,
        Cell: ({ row }) => (
          <Chip
            size="small"
            variant="filled"
            color={row.original.isOverReturnable ? "error" : "primary"}
            label={row.original.maxReturnableQuantity.toLocaleString()}
            sx={{
              // Always filled (not just on hover) so the max-returnable qty is
              // legible at a glance; red still flags an over-returnable line.
              // White ring makes the pill pop against the row's own blue tones.
              border: "1px solid #FFFFFF",
              "& .MuiChip-label": { color: "#FFFFFF" },
            }}
          />
        ),
      },
      {
        id: "requisitionWarning",
        header: "",
        size: 220,
        // Advisory only — a quiet amber note, deliberately NOT the red error chip used
        // for isOverReturnable. Never disables Confirm; purely informs the person
        // posting this return that material is already earmarked for production.
        Cell: ({ row }) =>
          row.original.requisitionShortfall > 0 ? (
            <Typography variant="caption" sx={{ color: "#eda100", fontWeight: 500 }}>
              ⚠ {row.original.requisitionShortfall.toLocaleString()} {row.original.unit}{" "}
              already reserved by an open Stores Requisition Note
            </Typography>
          ) : null,
      },
    ],
    [],
  );

  const table = useApparelProTable<SrnLineItemRowView>({
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
