import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

import { useApparelProTable } from "../../../themes/useApparelProTable";
import KpiTile from "../../common/kpi-tile";
import {
  useGetTransactionListReportHeaderQuery,
  useGetTransactionListReportLinesQuery,
  useDownloadTransactionListReportPdfMutation,
} from "../../../tanstack-hooks/orderwise-inventory/transaction-list-report.hooks";
import type { TransactionListReportLine } from "../../../interfaces/orderwise-inventory/transaction-list-report.types";
import type { AppError } from "../../../auth/axiosClient";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../../themes/useDropdownTheme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
} from "../../../themes/workspace-theme";

// Matches the authoritative type-code -> name list already established in
// StockMovementItemReportService.cs, not legacy IN_DLIST.PRG's own literal codes
// ("0G" -> "GR" for Goods Received - this codebase's own established deviation).
const TRANSACTION_TYPE_OPTIONS: { code: string; label: string }[] = [
  { code: "", label: "All Transactions" },
  { code: "0S", label: "Stores Requisition Notes" },
  { code: "GR", label: "Goods Received Notes" },
  { code: "4I", label: "Goods Issue Notes" },
  { code: "1T", label: "Goods Transfer Notes (In)" },
  { code: "6T", label: "Goods Transfer Notes (Out)" },
  { code: "2R", label: "Goods Return Notes" },
  { code: "7S", label: "Supplier Return Notes" },
  { code: "5D", label: "Damaged Goods Notes" },
  { code: "3A", label: "Stock Adjustment Notes" },
  { code: "4X", label: "Additional Issue Notes" },
  { code: "0X", label: "Additional Receipts Notes" },
];

// Replicates IN_DLIST.PRG's "LIST OF TRANSACTIONS" (Orderwise) - a flat
// OrderwiseStockTransactions log for a date range, no running balance/totals.
export default function TransactionListReportWorkspace() {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [transactionType, setTransactionType] = useState<string>("");
  const [itemCodePrefix, setItemCodePrefix] = useState<string>("");

  const [searchedParams, setSearchedParams] = useState<{
    fromDate: string;
    toDate: string;
    transactionType?: string;
    itemCodePrefix?: string;
  } | null>(null);

  const isReady = !!searchedParams;

  const {
    data: header,
    isLoading: isHeaderLoading,
    isError,
    error,
  } = useGetTransactionListReportHeaderQuery(searchedParams ?? { fromDate: "", toDate: "" }, isReady);
  const { data: lines = [], isLoading: isLinesLoading } = useGetTransactionListReportLinesQuery(
    searchedParams ?? { fromDate: "", toDate: "" },
    isReady && !isError,
  );
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadTransactionListReportPdfMutation();

  const handleLoad = () => {
    if (!fromDate || !toDate) return;
    setSearchedParams({
      fromDate,
      toDate,
      transactionType: transactionType || undefined,
      itemCodePrefix: itemCodePrefix.trim() || undefined,
    });
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

  const numericCell = (value: number, digits = 2) => value.toLocaleString(undefined, { minimumFractionDigits: digits });

  const columns = useMemo<MRT_ColumnDef<TransactionListReportLine>[]>(
    () => [
      { accessorKey: "transactionTypeName", header: "Type", size: 150 },
      { accessorKey: "transactionDate", header: "Date", size: 90 },
      { accessorKey: "documentNumber", header: "Doc No", size: 75 },
      { accessorKey: "storeCode", header: "Basis", size: 60 },
      { accessorKey: "itemCode", header: "Item Code", size: 130 },
      { accessorKey: "description", header: "Description", size: 180 },
      {
        accessorKey: "quantity",
        header: "Qty",
        size: 80,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      { accessorKey: "unit", header: "Unit", size: 50, enableSorting: false, enableColumnFilter: false },
      {
        accessorKey: "price",
        header: "Price",
        size: 85,
        Cell: ({ cell }) => numericCell(cell.getValue<number>(), 4),
      },
      {
        accessorKey: "value",
        header: "Value",
        size: 95,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      { accessorKey: "currency", header: "Curr", size: 55, enableSorting: false },
      { accessorKey: "supplierName", header: "Supplier", size: 160 },
      { accessorKey: "buyerCode", header: "Buyer", size: 60 },
      { accessorKey: "order", header: "Order", size: 90 },
    ],
    [],
  );

  const isLoading = isHeaderLoading || isLinesLoading;

  const table = useApparelProTable<TransactionListReportLine>({
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
    <Box sx={{ width: "100%", p: 1 }}>
      <Paper elevation={3} sx={{ p: 3, borderTop: `4px solid ${DASHBOARD_COLORS.accent}`, backgroundColor: DASHBOARD_COLORS.pageBg }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
          <Typography variant="h5" sx={workspaceHeadingSx}>
            List of Transactions (Orderwise Inventory)
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
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              type="date"
              label="From Date"
              size="small"
              fullWidth
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={dropdownFieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              type="date"
              label="To Date"
              size="small"
              fullWidth
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={dropdownFieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              label="Transaction Type"
              size="small"
              fullWidth
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              slotProps={{ select: { displayEmpty: true, MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } }, inputLabel: { shrink: true } }}
              sx={dropdownFieldSx}
            >
              {TRANSACTION_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.code} value={opt.code}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              label="Item Code Prefix"
              size="small"
              fullWidth
              value={itemCodePrefix}
              onChange={(e) => setItemCodePrefix(e.target.value)}
              placeholder="optional"
              sx={dropdownFieldSx}
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

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Select a From/To Date (Type and Item Code Prefix are optional), then click Load.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? "Unable to load the List of Transactions."}
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
              <KpiTile label="Type" value={header?.transactionTypeName ?? "ALL"} loading={isLoading} size={{ xs: 12, sm: 6, md: 4, lg: 4 }} />
              <KpiTile label="Line Items" value={header?.totalLineItems} loading={isLoading} size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
              <KpiTile
                label="Total"
                value={header?.totalValueCurrency ? `${numericCell(header.totalValue)} ${header.totalValueCurrency}` : undefined}
                loading={isLoading}
                color="#60a5fa"
                size={{ xs: 12, sm: 6, md: 2, lg: 2 }}
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
