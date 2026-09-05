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
import { useGetGeneralStoresQuery } from "../../../tanstack-hooks/general-inventory/general-inventory-strn.hooks";
import {
  useGetGeneralStockStatusReportHeaderQuery,
  useGetGeneralStockStatusReportLinesQuery,
  useDownloadGeneralStockStatusReportPdfMutation,
} from "../../../tanstack-hooks/general-inventory/general-stock-status-report.hooks";
import type { GeneralStockStatusReportLine } from "../../../interfaces/general-inventory/general-stock-status-report.types";
import type { AppError } from "../../../auth/axiosClient";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Replicates GI_SSTAT.PRG's "STOCK STATUS REPORT" - see
// GeneralStockStatusReportService for why this is a full chronological replay of
// GeneralStockTransactions rather than a stored gi_monst read (that table was
// deliberately never built for this system).
export default function GeneralStockStatusReportWorkspace() {
  const now = new Date();
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  const [searchedParams, setSearchedParams] = useState<{ storeCode: string; month: number; year: number } | null>(null);

  const { data: storesList = [], isLoading: isStoresLoading } = useGetGeneralStoresQuery();

  const isReady = !!searchedParams;

  const {
    data: header,
    isLoading: isHeaderLoading,
    isError,
    error,
  } = useGetGeneralStockStatusReportHeaderQuery(searchedParams ?? { storeCode: "", month: 1, year: 2000 }, isReady);
  const { data: lines = [], isLoading: isLinesLoading } = useGetGeneralStockStatusReportLinesQuery(
    searchedParams ?? { storeCode: "", month: 1, year: 2000 },
    isReady && !isError,
  );
  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadGeneralStockStatusReportPdfMutation();

  const handleLoad = () => {
    if (!selectedStore) return;
    setSearchedParams({ storeCode: selectedStore, month: selectedMonth, year: selectedYear });
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

  const numericCell = (value: number | null | undefined) =>
    value != null ? value.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "";

  const columns = useMemo<MRT_ColumnDef<GeneralStockStatusReportLine>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 100 },
      { accessorKey: "description", header: "Description", size: 140 },
      { accessorKey: "unit", header: "Unit", size: 45, enableSorting: false, enableColumnFilter: false },
      {
        accessorKey: "broughtForwardBalance",
        header: "B/F Bal.",
        size: 65,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "totalGrns",
        header: "GRNs",
        size: 55,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "totalGins",
        header: "GINs",
        size: 55,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "totalGtnsIn",
        header: "GTNs In",
        size: 60,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "totalGtnsOut",
        header: "GTNs Out",
        size: 60,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "totalRtns",
        header: "RTNs",
        size: 55,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "totalSrns",
        header: "SRNs",
        size: 55,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "totalDgns",
        header: "DGNs",
        size: 55,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "lastSan",
        header: "Last SAN",
        size: 65,
        Cell: ({ cell }) => numericCell(cell.getValue<number | null>()),
      },
      {
        accessorKey: "carriedForwardBalance",
        header: "C/F Bal.",
        size: 65,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
    ],
    [],
  );

  const isLoading = isHeaderLoading || isLinesLoading;

  const table = useApparelProTable<GeneralStockStatusReportLine>({
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
      <Paper elevation={3} sx={{ p: 3, backgroundColor: "#f9f9f9" }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Stock Status Report (General Inventory)
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3, alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Stores"
              size="small"
              fullWidth
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              disabled={isStoresLoading}
            >
              {storesList.map((s) => (
                <MenuItem key={s.code} value={s.code}>
                  {s.description} [{s.code}]
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Month"
              size="small"
              fullWidth
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
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
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleLoad}
              disabled={!selectedStore}
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
          >
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
        </Box>

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Select a Store, Month and Year, then click Load.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? "No Transactions for given Year/Month/Stores."}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile label="Stores" value={header?.storeDescription} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
              <KpiTile
                label="Period"
                value={header ? `${MONTH_NAMES[header.month - 1]} ${header.year}` : undefined}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 3, lg: 12 }}
              />
              <KpiTile label="Items with Activity" value={header?.totalLineItems} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
            </Grid>
            <MaterialReactTable table={table} />
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>
    </Box>
  );
}
