import { useMemo, useState } from "react";
import { Alert, Box, Button, Divider, Paper, TextField, Typography, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

import { useApparelProTable } from "../../../themes/useApparelProTable";
import KpiTile from "../../common/kpi-tile";
import { useGetCurrenciesQuery } from "../../../tanstack-hooks/custom-hooks";
import {
  useGetStockSummaryReportHeaderQuery,
  useGetStockSummaryReportLinesQuery,
  useDownloadStockSummaryReportPdfMutation,
} from "../../../tanstack-hooks/orderwise-inventory/stock-summary-report.hooks";
import type { StockSummaryReportLine } from "../../../interfaces/orderwise-inventory/stock-summary-report.types";
import type { AppError } from "../../../auth/axiosClient";

// Replicates IN_SVAL2.PRG's "SUMMARY OF STOCK VALUE - Order-wise Inventory"
// (a.k.a. "Stock Summary Report - Basis wise" in IN_MENU.PRG) - system-wide,
// grouped by Stock Type then Store, valued in two chosen currencies, reading
// OrderwiseStock's live QtyInHand (no chronological replay needed).
export default function StockSummaryReportWorkspace() {
  const [currency1, setCurrency1] = useState<string>("");
  const [currency2, setCurrency2] = useState<string>("");
  const [searchedParams, setSearchedParams] = useState<{ currency1: string; currency2: string } | null>(null);

  const { data: currencyPage, isLoading: isCurrenciesLoading } = useGetCurrenciesQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: null,
    sortOrder: null,
    filterColumn: null,
    filterQuery: null,
  });
  const currenciesList = currencyPage?.items ?? [];

  const isReady = !!searchedParams;

  const {
    data: header,
    isLoading: isHeaderLoading,
    isError,
    error,
  } = useGetStockSummaryReportHeaderQuery(searchedParams ?? { currency1: "", currency2: "" }, isReady);
  const { data: lines = [], isLoading: isLinesLoading } = useGetStockSummaryReportLinesQuery(
    searchedParams ?? { currency1: "", currency2: "" },
    isReady && !isError,
  );
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadStockSummaryReportPdfMutation();

  const handleLoad = () => {
    if (!currency1 || !currency2) return;
    setSearchedParams({ currency1, currency2 });
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

  const columns = useMemo<MRT_ColumnDef<StockSummaryReportLine>[]>(
    () => [
      {
        id: "label",
        header: "Stock Type / Store",
        size: 260,
        accessorFn: (row) => {
          if (row.rowType === "GrandTotal") return "GRAND TOTAL";
          if (row.rowType === "StockTypeSubtotal") return `${row.stockTypeCode} - ${row.stockTypeDescription} (Sub Total)`;
          return row.storeCode;
        },
        Cell: ({ row }) => {
          const line = row.original;
          const bold = line.rowType !== "Store";
          const label =
            line.rowType === "GrandTotal"
              ? "GRAND TOTAL"
              : line.rowType === "StockTypeSubtotal"
                ? `${line.stockTypeCode} - ${line.stockTypeDescription} (Sub Total)`
                : line.storeCode;
          return <span style={{ fontWeight: bold ? 700 : 400, paddingLeft: line.rowType === "Store" ? 16 : 0 }}>{label}</span>;
        },
      },
      {
        accessorKey: "valueInCurrency1",
        header: `Value (${header?.currency1 ?? ""})`,
        size: 130,
        Cell: ({ row, cell }) => (
          <span style={{ fontWeight: row.original.rowType !== "Store" ? 700 : 400 }}>{numericCell(cell.getValue<number>())}</span>
        ),
      },
      {
        accessorKey: "valueInCurrency2",
        header: `Value (${header?.currency2 ?? ""})`,
        size: 130,
        Cell: ({ row, cell }) => (
          <span style={{ fontWeight: row.original.rowType !== "Store" ? 700 : 400 }}>{numericCell(cell.getValue<number>())}</span>
        ),
      },
    ],
    [header?.currency1, header?.currency2],
  );

  const isLoading = isHeaderLoading || isLinesLoading;

  const table = useApparelProTable<StockSummaryReportLine>({
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
    muiTableProps: { sx: { tableLayout: "fixed" } },
    initialState: { density: "compact", pagination: { pageIndex: 0, pageSize: 25 } },
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
            Stock Summary Report — Basis Wise (Orderwise Inventory)
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
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="1st Currency"
              size="small"
              fullWidth
              value={currency1}
              onChange={(e) => setCurrency1(e.target.value)}
              disabled={isCurrenciesLoading}
            >
              {currenciesList.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="2nd Currency"
              size="small"
              fullWidth
              value={currency2}
              onChange={(e) => setCurrency2(e.target.value)}
              disabled={isCurrenciesLoading}
            >
              {currenciesList.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleLoad}
              disabled={!currency1 || !currency2}
              fullWidth
            >
              Load
            </Button>
          </Grid>
        </Grid>

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Select two currencies, then click Load.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? "Given month's transactions are not available."}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile label="Stock Types" value={header?.totalStockTypes} loading={isLoading} size={{ xs: 12, sm: 6, md: 4, lg: 4 }} />
              <KpiTile
                label={`Grand Total (${header?.currency1 ?? ""})`}
                value={header ? numericCell(header.grandTotalCurrency1) : undefined}
                loading={isLoading}
                color="#60a5fa"
                size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
              />
              <KpiTile
                label={`Grand Total (${header?.currency2 ?? ""})`}
                value={header ? numericCell(header.grandTotalCurrency2) : undefined}
                loading={isLoading}
                color="#60a5fa"
                size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
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
