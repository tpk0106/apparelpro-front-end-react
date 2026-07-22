import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "material-react-table";
import { useApparelProTable } from "../../themes/useApparelProTable";
import type { StockMovementReportLine } from "./stock-movement-report.types";

interface Props {
  data: StockMovementReportLine[];
  itemsCount: number;
  isLoading: boolean;
  isError: boolean;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
  sorting: MRT_SortingState;
  setSorting: React.Dispatch<React.SetStateAction<MRT_SortingState>>;
}

// Status-color convention (dataviz palette): good/inbound green, critical/outbound red,
// warning/discrepancy amber — matching the PDF export's badge colors exactly. Color is
// never the only signal: every colored cell also carries the number itself, and the four
// placeholder columns (no backing module yet) render dimmed/italic with a footnote instead
// of a color, since a 0 from an unbuilt module isn't the same claim as a confirmed 0.
const INBOUND = "#0ca30c";
const OUTBOUND = "#d03b3b";
const DISCREPANCY = "#fab219";

function QuantityCell({
  value,
  color,
  placeholder,
}: {
  value: number;
  color?: string;
  placeholder?: boolean;
}) {
  if (placeholder) {
    return (
      <Typography
        component="span"
        variant="body2"
        sx={{ color: "text.disabled", fontStyle: "italic" }}
        title="No source module yet — always 0 until Stock Transfer / Supplier Return / Adjustment Note is built"
      >
        {value.toLocaleString()} *
      </Typography>
    );
  }
  if (!color || value === 0) {
    return <span>{value.toLocaleString()}</span>;
  }
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1,
        py: 0.25,
        borderRadius: "10px",
        fontWeight: 700,
        fontSize: "0.8rem",
        backgroundColor: `${color}29`,
        color,
      }}
    >
      {value.toLocaleString()}
    </Box>
  );
}

export default function StockMovementReportGrid({
  data,
  itemsCount,
  isLoading,
  isError,
  pagination,
  setPagination,
  sorting,
  setSorting,
}: Props) {
  const columns = useMemo<MRT_ColumnDef<StockMovementReportLine>[]>(
    () => [
      {
        // itemCode from the API is the full 22-char composite (StockCode 2 +
        // ItemCode 4 + Feature1-4 x4) — same convention as OrderwiseStockMaster/
        // PODetails. Legacy IN_SMVE2.PRG prints this whole string as-is (line 100:
        // "@ ln,00 say item_cd"), but at a fixed column width it just reads as
        // "..." here. Per user decision: show both — the short 4-char item code
        // as the primary value (chars 2-5 of the composite, matching the same
        // decomposition StoresRequisitionService already uses), full composite
        // available on hover so nothing is hidden.
        accessorKey: "itemCode",
        header: "Item Code",
        size: 110,
        Cell: ({ cell }) => {
          const fullItemCode = cell.getValue<string>();
          const baseItemCode = fullItemCode.substring(2, 6).trim();
          return <span title={fullItemCode}>{baseItemCode || fullItemCode}</span>;
        },
      },
      { accessorKey: "description", header: "Description", size: 220 },
      {
        accessorKey: "unit",
        header: "Unit",
        size: 70,
        enableSorting: false,
      },
      {
        accessorKey: "orderedQuantity",
        header: "Ordered",
        size: 100,
        Cell: ({ cell }) => <QuantityCell value={cell.getValue<number>()} />,
      },
      {
        accessorKey: "receivedQuantity",
        header: "Received (GRN)",
        size: 140,
        Cell: ({ cell }) => (
          <QuantityCell value={cell.getValue<number>()} color={INBOUND} />
        ),
      },
      {
        accessorKey: "requisitionedQuantity",
        header: "Requisitioned (SRN)",
        size: 160,
        Cell: ({ cell }) => <QuantityCell value={cell.getValue<number>()} />,
      },
      {
        accessorKey: "issuedQuantity",
        header: "Issued (GIN)",
        size: 120,
        Cell: ({ cell }) => (
          <QuantityCell value={cell.getValue<number>()} color={OUTBOUND} />
        ),
      },
      {
        accessorKey: "transferInQuantity",
        header: "Transfer In *",
        size: 120,
        Cell: ({ cell }) => (
          <QuantityCell value={cell.getValue<number>()} placeholder />
        ),
      },
      {
        accessorKey: "transferOutQuantity",
        header: "Transfer Out *",
        size: 120,
        Cell: ({ cell }) => (
          <QuantityCell value={cell.getValue<number>()} placeholder />
        ),
      },
      {
        accessorKey: "supplierReturnQuantity",
        header: "Supplier Return *",
        size: 140,
        Cell: ({ cell }) => (
          <QuantityCell value={cell.getValue<number>()} placeholder />
        ),
      },
      {
        accessorKey: "lastAdjustmentQuantity",
        header: "Last Adjustment *",
        size: 140,
        Cell: ({ cell }) => (
          <QuantityCell value={cell.getValue<number>()} placeholder />
        ),
      },
      {
        accessorKey: "damagedQuantity",
        header: "Damaged",
        size: 100,
        Cell: ({ cell }) => (
          <QuantityCell value={cell.getValue<number>()} color={DISCREPANCY} />
        ),
      },
      {
        accessorKey: "balanceQuantity",
        header: "Balance",
        size: 110,
        Cell: ({ cell }) => (
          <Typography
            component="span"
            variant="body2"
            sx={{ fontWeight: 700 }}
          >
            {cell.getValue<number>().toLocaleString()}
          </Typography>
        ),
      },
    ],
    [],
  );

  const table = useApparelProTable<StockMovementReportLine>({
    columns,
    data,
    initialState: { density: "compact" },

    // Read-only report grid — no row CRUD.
    enableEditing: false,
    enableColumnActions: false,
    enableRowActions: false,

    // This report has unusually long/dense header labels ("Requisitioned (SRN)",
    // "Supplier Return *", "Last Adjustment *") that MRT's default single-line,
    // ellipsis-truncated header would clip to "...". Let headers wrap onto two
    // lines instead of truncating — scoped to this grid only via the table-level
    // override, not the shared useApparelProTable hook, so other grids keep their
    // existing single-line header behavior.
    muiTableHeadCellProps: {
      sx: {
        "& .Mui-TableHeadCell-Content-Wrapper": {
          whiteSpace: "normal",
          overflow: "visible",
          textOverflow: "clip",
          lineHeight: 1.25,
        },
      },
    },

    rowCount: itemsCount,
    manualPagination: true,
    manualSorting: true,
    paginationDisplayMode: "pages",
    muiPaginationProps: {
      color: "secondary",
      rowsPerPageOptions: [10, 25, 50],
      shape: "rounded",
      variant: "outlined",
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,

    state: {
      pagination,
      sorting,
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
  });

  return <MaterialReactTable table={table} />;
}
