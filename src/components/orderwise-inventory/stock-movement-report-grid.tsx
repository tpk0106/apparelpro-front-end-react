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
        // PODetails, and now shown plainly (no hover-only shortcut) to match the
        // STRN Print Report and because a hidden tooltip isn't discoverable.
        accessorKey: "itemCode",
        header: "Item Code",
        size: 175,
      },
      { accessorKey: "description", header: "Description", size: 170 },
      {
        accessorKey: "unit",
        header: "Unit",
        size: 45,
        enableSorting: false,
      },
      {
        accessorKey: "orderedQuantity",
        header: "Ordered",
        size: 80,
        Cell: ({ cell }) => <QuantityCell value={cell.getValue<number>()} />,
      },
      {
        accessorKey: "receivedQuantity",
        header: "Received (GRN)",
        size: 95,
        Cell: ({ cell }) => (
          <QuantityCell value={cell.getValue<number>()} color={INBOUND} />
        ),
      },
      {
        accessorKey: "requisitionedQuantity",
        header: "Requisitioned (SRN)",
        size: 100,
        Cell: ({ cell }) => <QuantityCell value={cell.getValue<number>()} />,
      },
      {
        accessorKey: "issuedQuantity",
        header: "Issued (GIN)",
        size: 85,
        Cell: ({ cell }) => (
          <QuantityCell value={cell.getValue<number>()} color={OUTBOUND} />
        ),
      },
      {
        accessorKey: "transferInQuantity",
        header: "Transfer In *",
        size: 80,
        Cell: ({ cell }) => (
          <QuantityCell value={cell.getValue<number>()} placeholder />
        ),
      },
      {
        accessorKey: "transferOutQuantity",
        header: "Transfer Out *",
        size: 80,
        Cell: ({ cell }) => (
          <QuantityCell value={cell.getValue<number>()} placeholder />
        ),
      },
      {
        accessorKey: "supplierReturnQuantity",
        header: "Supplier Return *",
        size: 90,
        Cell: ({ cell }) => (
          <QuantityCell value={cell.getValue<number>()} placeholder />
        ),
      },
      {
        accessorKey: "lastAdjustmentQuantity",
        header: "Last Adjustment *",
        size: 90,
        Cell: ({ cell }) => (
          <QuantityCell value={cell.getValue<number>()} placeholder />
        ),
      },
      {
        accessorKey: "damagedQuantity",
        header: "Damaged",
        size: 80,
        Cell: ({ cell }) => (
          <QuantityCell value={cell.getValue<number>()} color={DISCREPANCY} />
        ),
      },
      {
        accessorKey: "balanceQuantity",
        header: "Balance",
        size: 85,
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
        fontSize: "0.72rem",
        padding: "6px 4px",
        "& .Mui-TableHeadCell-Content-Wrapper": {
          whiteSpace: "normal",
          overflow: "visible",
          textOverflow: "clip",
          lineHeight: 1.25,
        },
      },
    },

    // NOTE on what actually shrinks the table: MRT's column `size` values ARE
    // the pixel widths (default layoutMode) — padding/font here sit *inside*
    // that width, they don't add to or reduce the table's total width. So the
    // padding/font drop below is only to keep numbers legible now that columns
    // are narrower; the actual fix for the residual scroll is the second round
    // of `size` trims above (1370px -> 1255px column-width sum) plus pulling
    // the outer margin in from mx:3 to mx:2 below (reclaims 16px of viewport).
    muiTableBodyCellProps: {
      sx: {
        fontSize: "0.72rem",
        padding: "4px 4px",
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

  return (
    // Left/right margin so the table sits inset from the page edges instead of
    // spanning full-bleed — pulled in from 3 to 2 on md+ so the margin doesn't
    // eat back into the width just reclaimed from column/padding trims.
    // overflowX stays as a safety net only: with the trimmed sizes and font
    // this shouldn't be needed on a normal desktop viewport, but it keeps any
    // remaining overflow contained to the table instead of the whole page.
    <Box sx={{ mx: { xs: 1, md: 2 }, overflowX: "auto" }}>
      <MaterialReactTable table={table} />
    </Box>
  );
}
