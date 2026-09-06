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
import { useGetCurrenciesQuery } from "../../../tanstack-hooks/custom-hooks";
import {
  useGetGeneralStockSummaryReportHeaderQuery,
  useGetGeneralStockSummaryReportLinesQuery,
  useDownloadGeneralStockSummaryReportPdfMutation,
} from "../../../tanstack-hooks/general-inventory/general-stock-summary-report.hooks";
import type { GeneralStockSummaryReportLine } from "../../../interfaces/general-inventory/general-stock-summary-report.types";
import type { AppError } from "../../../auth/axiosClient";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
  numberFieldNoSpinnerSx,
} from "../../../themes/workspace-theme";
import { useDropdownTheme } from "../../../themes/useDropdownTheme";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Replicates GI_STVAL.PRG's "SUMMARY OF STOCK VALUATION REPORT" - grouped by Stock
// Type then Store, valued in two chosen currencies. See
// GeneralStockSummaryReportService for why this computes each item/store's month-end
// balance via a single chronological replay rather than legacy's apparent
// multi-month gi_monst summation (a likely legacy double-counting bug).
export default function GeneralStockSummaryReportWorkspace() {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } =
    useDropdownTheme();
  const dropdownMenuSlotProps = {
    select: { MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } },
  };
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [currency1, setCurrency1] = useState<string>("");
  const [currency2, setCurrency2] = useState<string>("");

  const [searchedParams, setSearchedParams] = useState<{
    month: number;
    year: number;
    currency1: string;
    currency2: string;
  } | null>(null);

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
  } = useGetGeneralStockSummaryReportHeaderQuery(
    searchedParams ?? { month: 1, year: 2000, currency1: "", currency2: "" },
    isReady,
  );
  const { data: lines = [], isLoading: isLinesLoading } = useGetGeneralStockSummaryReportLinesQuery(
    searchedParams ?? { month: 1, year: 2000, currency1: "", currency2: "" },
    isReady && !isError,
  );
  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadGeneralStockSummaryReportPdfMutation();

  const handleLoad = () => {
    if (!currency1 || !currency2) return;
    setSearchedParams({ month: selectedMonth, year: selectedYear, currency1, currency2 });
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

  const columns = useMemo<MRT_ColumnDef<GeneralStockSummaryReportLine>[]>(
    () => [
      {
        id: "label",
        header: "Stock Type / Store",
        size: 260,
        accessorFn: (row) => {
          if (row.rowType === "GrandTotal") return "GRAND TOTAL";
          if (row.rowType === "StockTypeSubtotal") return `${row.stockTypeCode} - ${row.stockTypeDescription} (Sub Total)`;
          return `${row.storeCode} - ${row.storeDescription}`;
        },
        Cell: ({ row }) => {
          const line = row.original;
          const bold = line.rowType !== "Store";
          const label =
            line.rowType === "GrandTotal"
              ? "GRAND TOTAL"
              : line.rowType === "StockTypeSubtotal"
                ? `${line.stockTypeCode} - ${line.stockTypeDescription} (Sub Total)`
                : `${line.storeCode} - ${line.storeDescription}`;
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

  const table = useApparelProTable<GeneralStockSummaryReportLine>({
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
    <Box sx={{ width: "95%", mx: "auto", p: 1 }}>
      <Paper elevation={3} sx={{ p: 3, backgroundColor: DASHBOARD_COLORS.pageBg }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h5" sx={workspaceHeadingSx}>
            Stock Summary Report (General Inventory)
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3, alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              label="Month"
              size="small"
              fullWidth
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              sx={dropdownFieldSx}
              slotProps={dropdownMenuSlotProps}
            >
              {MONTH_NAMES.map((name, idx) => (
                <MenuItem key={name} value={idx + 1}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              type="number"
              label="Year"
              size="small"
              fullWidth
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              slotProps={{ htmlInput: { min: 2000, max: 2100 } }}
              sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              label="1st Currency"
              size="small"
              fullWidth
              value={currency1}
              onChange={(e) => setCurrency1(e.target.value)}
              disabled={isCurrenciesLoading}
              sx={dropdownFieldSx}
              slotProps={dropdownMenuSlotProps}
            >
              {currenciesList.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              label="2nd Currency"
              size="small"
              fullWidth
              value={currency2}
              onChange={(e) => setCurrency2(e.target.value)}
              disabled={isCurrenciesLoading}
              sx={dropdownFieldSx}
              slotProps={dropdownMenuSlotProps}
            >
              {currenciesList.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleLoad}
              disabled={!currency1 || !currency2}
              fullWidth
              sx={primaryActionButtonSx}
            >
              <span style={themedButtonLabelStyle}>Load</span>
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
            Select a Year/Month and two currencies, then click Load.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? "Given month's transactions are not available."}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile
                label="Period"
                value={header ? `${MONTH_NAMES[header.month - 1]} ${header.year}` : undefined}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 3, lg: 3 }}
              />
              <KpiTile label="Stock Types" value={header?.totalStockTypes} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 3 }} />
              <KpiTile
                label={`Grand Total (${header?.currency1 ?? ""})`}
                value={header ? numericCell(header.grandTotalCurrency1) : undefined}
                loading={isLoading}
                color="#60a5fa"
                size={{ xs: 12, sm: 6, md: 3, lg: 3 }}
              />
              <KpiTile
                label={`Grand Total (${header?.currency2 ?? ""})`}
                value={header ? numericCell(header.grandTotalCurrency2) : undefined}
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
