import { useMemo } from "react";
import { Chip, Typography } from "@mui/material";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
} from "material-react-table";
import { useApparelProTable } from "../../themes/useApparelProTable";
import {
  INBOUND_TRANSACTION_TYPES,
  OUTBOUND_TRANSACTION_TYPES,
  type StockMovementItemReportLine,
} from "./stock-movement-item-report.types";

interface Props {
  data: StockMovementItemReportLine[];
  itemsCount: number;
  isLoading: boolean;
  isError: boolean;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

const INBOUND = "#0ca30c";
const OUTBOUND = "#d03b3b";

function directionColor(transactionType: string): string | undefined {
  if (INBOUND_TRANSACTION_TYPES.includes(transactionType)) return INBOUND;
  if (OUTBOUND_TRANSACTION_TYPES.includes(transactionType)) return OUTBOUND;
  return undefined;
}

// Same "filled chip, white ring" badge convention as the sibling Order-level report's
// QuantityCell (and Max Returnable/Transferable/Damageable elsewhere in Orderwise
// Inventory) — a colored chip only when a direction color applies AND the value is
// non-zero; otherwise plain text. This keeps neutral transaction types (0S/3A/4X) and
// any zero-quantity line from being visually flagged as if they were a real
// inbound/outbound movement.
function QuantityCell({ value, color }: { value: number; color?: string }) {
  if (!color || value === 0) {
    return <span>{value.toLocaleString()}</span>;
  }
  return (
    <Chip
      size="small"
      variant="filled"
      label={value.toLocaleString()}
      sx={{
        height: 22,
        fontWeight: 700,
        fontSize: "0.72rem",
        backgroundColor: color,
        border: "1.5px solid #FFFFFF",
        borderRadius: "11px",
        "& .MuiChip-label": { color: "#FFFFFF", px: 1 },
      }}
    />
  );
}

export default function StockMovementItemReportGrid({
  data,
  itemsCount,
  isLoading,
  isError,
  pagination,
  setPagination,
}: Props) {
  const columns = useMemo<MRT_ColumnDef<StockMovementItemReportLine>[]>(
    () => [
      {
        accessorKey: "transactionDate",
        header: "Date",
        size: 80,
        Cell: ({ cell }) =>
          new Date(cell.getValue<string>()).toLocaleDateString("en-GB"),
      },
      { accessorKey: "documentNumber", header: "Doc. No", size: 80 },
      {
        accessorKey: "transactionTypeName",
        header: "Document Name",
        size: 180,
      },
      {
        accessorKey: "quantity",
        header: "Amount",
        size: 80,
        Cell: ({ row }) => (
          <QuantityCell
            value={row.original.quantity}
            color={directionColor(row.original.transactionType)}
          />
        ),
      },
      {
        accessorKey: "balanceAfter",
        header: "Balance",
        size: 80,
        Cell: ({ cell }) => (
          <Typography
            component="span"
            variant="body2"
            sx={{ fontWeight: 700, fontSize: "0.78rem" }}
          >
            {cell.getValue<number>().toLocaleString()}
          </Typography>
        ),
      },
    ],
    [],
  );

  // Read-only, chronologically-fixed ledger — the backend's balance calculation
  // requires the full transaction history in date order, so sorting isn't offered
  // (there is no sortColumn/sortOrder on GetLinesAsync, unlike the sibling Order
  // report, precisely because re-sorting would invalidate the running balance).
  const table = useApparelProTable<StockMovementItemReportLine>({
    columns,
    data,
    initialState: { density: "compact" },
    enableEditing: false,
    enableColumnActions: false,
    enableRowActions: false,
    enableSorting: false,
    layoutMode: "grid",
    enableColumnResizing: false,
    rowCount: itemsCount,
    manualPagination: true,
    paginationDisplayMode: "pages",
    muiPaginationProps: {
      color: "secondary",
      rowsPerPageOptions: [10, 25, 50],
      shape: "rounded",
      variant: "outlined",
    },
    onPaginationChange: setPagination,
    muiTableHeadCellProps: {
      sx: { fontSize: "0.7rem", lineHeight: 1.2, px: 0.75, py: 0.5 },
    },
    muiTableBodyCellProps: {
      sx: { fontSize: "0.75rem", px: 0.75, py: 0.4 },
    },
    muiTableContainerProps: { sx: { overflowX: "hidden" } },
    state: {
      pagination,
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
  });

  return <MaterialReactTable table={table} />;
}
