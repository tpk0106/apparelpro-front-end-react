import { useMemo, useState } from "react";
import { Alert, Box, Button, Divider, Paper, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

import { useApparelProTable } from "../../../themes/useApparelProTable";
import KpiTile from "../../common/kpi-tile";
import {
  useGetItemWiseStockBalanceHeaderQuery,
  useGetItemWiseStockBalanceLinesQuery,
  useDownloadItemWiseStockBalancePdfMutation,
} from "../../../tanstack-hooks/orderwise-inventory/item-wise-stock-balance.hooks";
import type { ItemWiseStockBalanceLine } from "../../../interfaces/orderwise-inventory/item-wise-stock-balance.types";
import type { AppError } from "../../../auth/axiosClient";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../../themes/useDropdownTheme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
} from "../../../themes/workspace-theme";

// Replicates IN_STBAL.PRG's "ITEM-WISE STOCK BALANCES" (Orderwise) - system-wide
// (every Buyer/Order), filtered to a 6-char Stock+Item code range, grouped Stock
// Type -> Item group -> individual lines. Zero-balance items excluded.
export default function ItemWiseStockBalanceWorkspace() {
  const { fieldSx: dropdownFieldSx } = useDropdownTheme();
  const [fromRange, setFromRange] = useState<string>("");
  const [toRange, setToRange] = useState<string>("");
  const [searchedParams, setSearchedParams] = useState<{ fromRange: string; toRange: string } | null>(null);

  const isReady = !!searchedParams;

  const {
    data: header,
    isLoading: isHeaderLoading,
    isError,
    error,
  } = useGetItemWiseStockBalanceHeaderQuery(searchedParams ?? { fromRange: "", toRange: "" }, isReady);
  const { data: lines = [], isLoading: isLinesLoading } = useGetItemWiseStockBalanceLinesQuery(
    searchedParams ?? { fromRange: "", toRange: "" },
    isReady && !isError,
  );
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadItemWiseStockBalancePdfMutation();

  const handleLoad = () => {
    if (!fromRange || !toRange) return;
    setSearchedParams({ fromRange: fromRange.toUpperCase(), toRange: toRange.toUpperCase() });
  };

  const handleDownloadPdf = async () => {
    if (!searchedParams) return;
    try {
      await downloadPdf(searchedParams);
    } catch (err) {
      const appError = err as AppError;
      toast.error(appError?.message ?? "Failed to generate the PDF.");
    }
  };

  const numericCell = (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 2 });

  const columns = useMemo<MRT_ColumnDef<ItemWiseStockBalanceLine>[]>(
    () => [
      {
        id: "label",
        header: "Item / Group",
        size: 220,
        accessorFn: (row) => {
          if (row.rowType === "GrandTotal") return "TOTAL VALUE";
          if (row.rowType === "StockTypeSubtotal") return `${row.stockTypeCode} - ${row.stockTypeDescription} (Total)`;
          if (row.rowType === "ItemGroupSubtotal") return `${row.itemGroupCode} - ${row.itemGroupDescription} (Total)`;
          return `${row.buyerCode}/${row.order} - ${row.itemCode}`;
        },
        Cell: ({ row }) => {
          const line = row.original;
          const bold = line.rowType !== "Item";
          const big = line.rowType === "GrandTotal";
          const label =
            line.rowType === "GrandTotal"
              ? "TOTAL VALUE"
              : line.rowType === "StockTypeSubtotal"
                ? `${line.stockTypeCode} - ${line.stockTypeDescription} (Total)`
                : line.rowType === "ItemGroupSubtotal"
                  ? `${line.itemGroupCode} - ${line.itemGroupDescription} (Total)`
                  : `${line.buyerCode}/${line.order} - ${line.itemCode}`;
          return <span style={{ fontWeight: bold ? 700 : 400, fontSize: big ? "1.05em" : undefined }}>{label}</span>;
        },
      },
      { accessorKey: "description", header: "Description", size: 160 },
      { accessorKey: "unit", header: "Unit", size: 50, enableSorting: false, enableColumnFilter: false },
      {
        accessorKey: "unitPrice",
        header: "U/Price",
        size: 80,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "receivedQuantity",
        header: "Rcvd Qty",
        size: 80,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "receivedValue",
        header: "Rcvd Value",
        size: 95,
        Cell: ({ row, cell }) => <span style={{ fontWeight: row.original.rowType !== "Item" ? 700 : 400 }}>{numericCell(cell.getValue<number>())}</span>,
      },
      {
        accessorKey: "qtyInHand",
        header: "Qty In Hand",
        size: 90,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "balanceValue",
        header: "Balance Value",
        size: 100,
        Cell: ({ row, cell }) => <span style={{ fontWeight: row.original.rowType !== "Item" ? 700 : 400 }}>{numericCell(cell.getValue<number>())}</span>,
      },
    ],
    [],
  );

  const isLoading = isHeaderLoading || isLinesLoading;

  const table = useApparelProTable<ItemWiseStockBalanceLine>({
    columns,
    data: lines,
    enableEditing: false,
    enableColumnActions: false,
    enableRowActions: false,
    enableColumnResizing: false,
    enableSorting: false,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    muiTableHeadCellProps: { sx: { whiteSpace: "normal", lineHeight: 1.2 } },
    initialState: { density: "compact", pagination: { pageIndex: 0, pageSize: 25 } },
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
  });

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Paper elevation={3} sx={{ p: 3, borderTop: `4px solid ${DASHBOARD_COLORS.accent}`, backgroundColor: DASHBOARD_COLORS.pageBg }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
          <Typography variant="h5" sx={workspaceHeadingSx}>
            Item-wise Stock Balances (Orderwise Inventory)
          </Typography>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownloadPdf}
            disabled={!isReady || isError || isDownloading}
            sx={primaryActionButtonSx}
          >
            <span style={themedButtonLabelStyle}>
              {isDownloading ? "Generating..." : "Download PDF"}
            </span>
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="From Stock/Item (6 char)"
              size="small"
              fullWidth
              value={fromRange}
              onChange={(e) => setFromRange(e.target.value)}
              placeholder="e.g. 02TISS"
              slotProps={{ htmlInput: { maxLength: 6 } }}
              sx={dropdownFieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="To Stock/Item (6 char)"
              size="small"
              fullWidth
              value={toRange}
              onChange={(e) => setToRange(e.target.value)}
              placeholder="e.g. 02TISS"
              slotProps={{ htmlInput: { maxLength: 6 } }}
              sx={dropdownFieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleLoad}
              disabled={!fromRange || !toRange}
              fullWidth
            >
              Load
            </Button>
          </Grid>
        </Grid>

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Enter a From/To Stock+Item code range (6 characters: 2-char Stock Code + 4-char Item Code), then click Load.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? "Given Stock/Item range not found."}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile label="Range" value={header ? `${header.fromRange} to ${header.toRange}` : undefined} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 3 }} />
              <KpiTile label="Currency" value={header?.currency} loading={isLoading} size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
              <KpiTile label="Line Items" value={header?.totalLineItems} loading={isLoading} size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
              <KpiTile
                label="Balance Value"
                value={header ? numericCell(header.totalBalanceValue) : undefined}
                loading={isLoading}
                color="#60a5fa"
                size={{ xs: 12, sm: 6, md: 5, lg: 5 }}
              />
            </Grid>
            <MaterialReactTable table={table} />
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>
    </Box>
  );
}
