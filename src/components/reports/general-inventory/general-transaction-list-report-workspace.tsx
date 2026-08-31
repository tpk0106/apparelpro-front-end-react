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
  useGetGeneralTransactionListReportHeaderQuery,
  useGetGeneralTransactionListReportLinesQuery,
  useDownloadGeneralTransactionListReportPdfMutation,
} from "../../../tanstack-hooks/general-inventory/general-transaction-list-report.hooks";
import type { GeneralTransactionListReportLine } from "../../../interfaces/general-inventory/general-transaction-list-report.types";
import type { AppError } from "../../../auth/axiosClient";

const TRANSACTION_TYPE_OPTIONS: { code: string; label: string }[] = [
  { code: "", label: "All Transactions" },
  { code: "0S", label: "Stores Requisition Notes" },
  { code: "0G", label: "Goods Received Notes" },
  { code: "4I", label: "Goods Issue Notes" },
  { code: "1TO", label: "Goods Transfer Notes (Order)" },
  { code: "1TG", label: "Goods Transfer Notes (General)" },
  { code: "2R", label: "Goods Return Notes" },
  { code: "7SR", label: "Supplier Return Notes" },
  { code: "6D", label: "Damaged Goods Notes" },
  { code: "3A", label: "Stock Adjustment Notes" },
];

// Replicates GI_DLIST.PRG's "LIST OF TRANSACTIONS" - a flat GeneralStockTransactions
// log for a date range, no running balance/totals. The "Item Code Prefix" filter
// matches legacy's "Stock/Item" entry (first 6 chars of the 22-char composite
// ItemCode) - this report has no physical Store filter, it spans every store.
export default function GeneralTransactionListReportWorkspace() {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [transactionTypeCode, setTransactionTypeCode] = useState<string>("");
  const [itemCodePrefix, setItemCodePrefix] = useState<string>("");

  const [searchedParams, setSearchedParams] = useState<{
    fromDate: string;
    toDate: string;
    transactionTypeCode?: string;
    itemCodePrefix?: string;
  } | null>(null);

  const isReady = !!searchedParams;

  const {
    data: header,
    isLoading: isHeaderLoading,
    isError,
    error,
  } = useGetGeneralTransactionListReportHeaderQuery(searchedParams ?? { fromDate: "", toDate: "" }, isReady);
  const { data: lines = [], isLoading: isLinesLoading } = useGetGeneralTransactionListReportLinesQuery(
    searchedParams ?? { fromDate: "", toDate: "" },
    isReady && !isError,
  );
  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadGeneralTransactionListReportPdfMutation();

  const handleLoad = () => {
    if (!fromDate || !toDate) return;
    setSearchedParams({
      fromDate,
      toDate,
      transactionTypeCode: transactionTypeCode || undefined,
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

  const columns = useMemo<MRT_ColumnDef<GeneralTransactionListReportLine>[]>(
    () => [
      { accessorKey: "documentTypeDescription", header: "Type", size: 160 },
      { accessorKey: "transactionDate", header: "Date", size: 90 },
      { accessorKey: "transactionTime", header: "Time", size: 75, enableColumnFilter: false, Cell: ({ cell }) => cell.getValue<string | null>() ?? "" },
      { accessorKey: "documentNumber", header: "Doc No", size: 80 },
      { accessorKey: "storeCode", header: "Store", size: 60 },
      { accessorKey: "itemCode", header: "Item Code", size: 130 },
      { accessorKey: "description", header: "Description", size: 180 },
      {
        accessorKey: "quantity",
        header: "Quantity",
        size: 85,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(undefined, { minimumFractionDigits: 2 }),
      },
      { accessorKey: "unit", header: "Unit", size: 55, enableSorting: false, enableColumnFilter: false },
    ],
    [],
  );

  const isLoading = isHeaderLoading || isLinesLoading;

  const table = useApparelProTable<GeneralTransactionListReportLine>({
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
      <Paper elevation={3} sx={{ p: 3, borderTop: "4px solid #60a5fa", backgroundColor: "#f9f9f9" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            List of Transactions (General Inventory)
          </Typography>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownloadPdf}
            disabled={!isReady || isError || isDownloading}
          >
            {isDownloading ? "Generating..." : "Download PDF"}
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
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              label="Transaction Type"
              size="small"
              fullWidth
              value={transactionTypeCode}
              onChange={(e) => setTransactionTypeCode(e.target.value)}
              slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
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
                size={{ xs: 12, sm: 6, md: 5, lg: 5 }}
              />
              <KpiTile
                label="Type"
                value={
                  header?.transactionTypeCode
                    ? TRANSACTION_TYPE_OPTIONS.find((o) => o.code === header.transactionTypeCode)?.label ?? header.transactionTypeCode
                    : "All Transactions"
                }
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 5, lg: 5 }}
              />
              <KpiTile label="Line Items" value={header?.totalLineItems} loading={isLoading} color="#60a5fa" size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
            </Grid>
            <MaterialReactTable table={table} />
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>
    </Box>
  );
}
