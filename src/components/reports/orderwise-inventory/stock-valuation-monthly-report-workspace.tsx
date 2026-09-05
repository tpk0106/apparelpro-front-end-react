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
  useGetStockValuationMonthlyReportHeaderQuery,
  useGetStockValuationMonthlyReportLinesQuery,
  useDownloadStockValuationMonthlyReportPdfMutation,
} from "../../../tanstack-hooks/orderwise-inventory/stock-valuation-monthly-report.hooks";
import type { StockValuationMonthlyReportLine } from "../../../interfaces/orderwise-inventory/stock-valuation-monthly-report.types";
import type { AppError } from "../../../auth/axiosClient";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../../themes/useDropdownTheme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
  dateIconFieldSx,
} from "../../../themes/workspace-theme";

// Replicates IN_SVAL1.PRG's "STOCK VALUATION REPORT (Monthly)" - item-level (Buyer/
// Order-agnostic) GR/4I totals for a date range. See
// StockValuationMonthlyReportService for why reporting currency/price is picked from
// whichever OrderwiseStockMaster row matches the item code first.
export default function StockValuationMonthlyReportWorkspace() {
  const { fieldSx: dropdownFieldSx } = useDropdownTheme();
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [searchedParams, setSearchedParams] = useState<{ fromDate: string; toDate: string } | null>(null);

  const isReady = !!searchedParams;

  const {
    data: header,
    isLoading: isHeaderLoading,
    isError,
    error,
  } = useGetStockValuationMonthlyReportHeaderQuery(searchedParams ?? { fromDate: "", toDate: "" }, isReady);
  const { data: lines = [], isLoading: isLinesLoading } = useGetStockValuationMonthlyReportLinesQuery(
    searchedParams ?? { fromDate: "", toDate: "" },
    isReady && !isError,
  );
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadStockValuationMonthlyReportPdfMutation();

  const handleLoad = () => {
    if (!fromDate || !toDate) return;
    setSearchedParams({ fromDate, toDate });
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

  const columns = useMemo<MRT_ColumnDef<StockValuationMonthlyReportLine>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 150 },
      { accessorKey: "description", header: "Description", size: 200 },
      { accessorKey: "unit", header: "Unit", size: 55, enableSorting: false, enableColumnFilter: false },
      { accessorKey: "currency", header: "Curr", size: 60, enableSorting: false, enableColumnFilter: false },
      {
        accessorKey: "unitPrice",
        header: "U/Price",
        size: 85,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "receivedQuantity",
        header: "Received Qty",
        size: 100,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "receivedValue",
        header: "Received Value",
        size: 110,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "issuedQuantity",
        header: "Issued Qty",
        size: 95,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "issuedValue",
        header: "Issued Value",
        size: 105,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
    ],
    [],
  );

  const isLoading = isHeaderLoading || isLinesLoading;

  const table = useApparelProTable<StockValuationMonthlyReportLine>({
    columns,
    data: lines,
    enableEditing: false,
    enableColumnActions: false,
    enableRowActions: false,
    enableColumnResizing: false,
    muiTableHeadCellProps: { sx: { whiteSpace: "normal", lineHeight: 1.2 } },
    initialState: { density: "compact", pagination: { pageIndex: 0, pageSize: 15 } },
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
  });

  return (
    <Box sx={{ width: "95%", mx: "auto", p: 1 }}>
      <Paper elevation={3} sx={{ p: 3, backgroundColor: DASHBOARD_COLORS.pageBg }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h5" sx={workspaceHeadingSx}>
            Stock Valuation Report — Monthly (Orderwise Inventory)
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3, alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              type="date"
              label="From Date"
              size="small"
              fullWidth
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ ...dropdownFieldSx, ...(dateIconFieldSx as Record<string, unknown>) }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              type="date"
              label="To Date"
              size="small"
              fullWidth
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ ...dropdownFieldSx, ...(dateIconFieldSx as Record<string, unknown>) }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleLoad}
              disabled={!fromDate || !toDate}
              fullWidth
            >
              Load
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
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

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Select a From/To Date, then click Load.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? "No transactions to print."}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile
                label="Date Range"
                value={header ? `${header.fromDate} to ${header.toDate}` : undefined}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
              />
              <KpiTile label="Line Items" value={header?.totalLineItems} loading={isLoading} size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
              <KpiTile
                label="Received Value"
                value={header ? numericCell(header.totalReceivedValue) : undefined}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 3, lg: 3 }}
              />
              <KpiTile
                label="Issued Value"
                value={header ? numericCell(header.totalIssuedValue) : undefined}
                loading={isLoading}
                color="#60a5fa"
                size={{ xs: 12, sm: 6, md: 3, lg: 3 }}
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
