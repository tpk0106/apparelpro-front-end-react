import { useMemo } from "react";
import { TextField, Chip, IconButton, MenuItem } from "@mui/material";
import type { MRT_ColumnDef } from "material-react-table";
import { MaterialReactTable } from "material-react-table";
import DeleteIcon from "@mui/icons-material/Delete";
import { useApparelProTable } from "../../themes/useApparelProTable";
import {
  noteTableHeadCellUppercaseSx,
  deleteRowIconButtonSx,
  numberFieldNoSpinnerSx,
} from "../../themes/workspace-theme";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import type { DtnLineItemRow, DtnToItem } from "./direct-transfer-note.types";

interface DirectTransferNoteLinesGridProps {
  lines: DtnLineItemRow[];
  setLines: React.Dispatch<React.SetStateAction<DtnLineItemRow[]>>;
  toOrderItems: DtnToItem[];
}

// Row-derived, read-only figures — recomputed on every render, never stored in state.
// The hard ceiling is the From-side QtyInHand at lookup time — this is a soft
// client-side warning only; the hard block always happens on the server
// (CommitDirectTransferNoteAsync — "Attempt to Exceed Balance Quantity"). A missing
// To Item mapping is likewise only flagged here — the server rejects any line whose
// mapped item doesn't already exist under the To Order's stock.
interface DtnLineItemRowView extends DtnLineItemRow {
  isOverTransferable: boolean;
  isMissingToItem: boolean;
}

export default function DirectTransferNoteLinesGrid({
  lines,
  setLines,
  toOrderItems,
}: DirectTransferNoteLinesGridProps) {
  const { fieldSx: dropdownFieldSx } = useDropdownTheme();

  const handleUpdateQuantity = (index: number, rawValue: string) => {
    const quantity = rawValue === "" ? 0 : Number(rawValue);
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity };
      return updated;
    });
  };

  const handleUpdateToItem = (index: number, toItemCode: string) => {
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], toItemCode };
      return updated;
    });
  };

  const handleRemoveLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const rows = useMemo<DtnLineItemRowView[]>(
    () =>
      lines.map((line) => {
        const quantity = Number(line.quantity || 0);
        return {
          ...line,
          isOverTransferable: quantity > line.maxTransferableQuantity,
          isMissingToItem: quantity > 0 && !line.toItemCode,
        };
      }),
    [lines],
  );

  const columns = useMemo<MRT_ColumnDef<DtnLineItemRowView>[]>(
    () => [
      { accessorKey: "fromItemCode", header: "From Item", size: 150 },
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
            sx={{ width: 100, ...numberFieldNoSpinnerSx }}
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
              border: "1px solid #FFFFFF",
              "& .MuiChip-label": { color: "#FFFFFF" },
            }}
          />
        ),
      },
      {
        accessorKey: "toItemCode",
        header: "To Item (Maps To)",
        size: 200,
        Cell: ({ row }) => (
          <TextField
            select
            size="small"
            variant="standard"
            fullWidth
            value={row.original.toItemCode}
            error={row.original.isMissingToItem}
            onChange={(e) => handleUpdateToItem(row.index, e.target.value)}
            sx={dropdownFieldSx}
          >
            {toOrderItems.map((item) => (
              <MenuItem key={item.itemCode} value={item.itemCode}>
                {item.itemCode} — {item.description}
              </MenuItem>
            ))}
          </TextField>
        ),
      },
    ],
    [toOrderItems, dropdownFieldSx],
  );

  const table = useApparelProTable<DtnLineItemRowView>({
    muiTableHeadCellProps: noteTableHeadCellUppercaseSx,
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
        sx={deleteRowIconButtonSx}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    ),
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        backgroundColor:
          row.original.isOverTransferable || row.original.isMissingToItem
            ? "rgba(248,113,113,0.12) !important"
            : undefined,
      },
    }),
    initialState: { density: "compact" },
  });

  return <MaterialReactTable table={table} />;
}
