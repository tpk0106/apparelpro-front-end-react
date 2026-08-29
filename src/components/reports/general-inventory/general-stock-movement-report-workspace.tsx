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
import { useGetGeneralStockMastersByStoreQuery } from "../../../tanstack-hooks/general-inventory/general-stock-master.hooks";
import {
  useGetGeneralStockMovementReportHeaderQuery,
  useGetGeneralStockMovementReportLinesQuery,
  useDownloadGeneralStockMovementReportPdfMutation,
} from "../../../tanstack-hooks/general-inventory/general-stock-movement-report.hooks";
import type { GeneralStockMovementReportLine } from "../../../interfaces/general-inventory/general-stock-movement-report.types";
import type { AppError } from "../../../auth/axiosClient";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Replicates GI_SMOVE.PRG's "STOCK MOVEMENT REPORT (for a Range)" - a per-item
// transaction-by-transaction ledger with a running balance, distinct from Stock
// Status Report's aggregated per-item totals. See GeneralStockMovementReportService
// for why this is a full chronological replay rather than a stored gi_monst read.
export default function GeneralStockMovementReportWorkspace() {
  const now = new Date();
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [selectedItemCode, setSelectedItemCode] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  const [searchedParams, setSearchedParams] = useState<{
    storeCode: string;
    itemCode: string;
    month: number;
    year: number;
  } | null>(null);

  const { data: storesList = [], isLoading: isStoresLoading } = useGetGeneralStoresQuery();
  const { data: itemsList = [], isLoading: isItemsLoading } = useGetGeneralStockMastersByStoreQuery(
    selectedStore,
    !!selectedStore,
  );

  const isReady = !!searchedParams;

  const {
    data: header,
    isLoading: isHeaderLoading,
    isError,
    error,
  } = useGetGeneralStockMovementReportHeaderQuery(
    searchedParams ?? { storeCode: "", itemCode: "", month: 1, year: 2000 },
    isReady,
  );
  const { data: lines = [], isLoading: isLinesLoading } = useGetGeneralStockMovementReportLinesQuery(
    searchedParams ?? { storeCode: "", itemCode: "", month: 1, year: 2000 },
    isReady && !isError,
  );
  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadGeneralStockMovementReportPdfMutation();

  const handleStoreChange = (storeCode: string) => {
    setSelectedStore(storeCode);
    setSelectedItemCode("");
  };

  const handleLoad = () => {
    if (!selectedStore || !selectedItemCode) return;
    setSearchedParams({ storeCode: selectedStore, itemCode: selectedItemCode, month: selectedMonth, year: selectedYear });
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

  const columns = useMemo<MRT_ColumnDef<GeneralStockMovementReportLine>[]>(
    () => [
      { accessorKey: "transactionDate", header: "Date", size: 90 },
      { accessorKey: "transactionTime", header: "Time", size: 75, enableColumnFilter: false, Cell: ({ cell }) => cell.getValue<string | null>() ?? "" },
      { accessorKey: "documentTypeDescription", header: "Document", size: 160 },
      { accessorKey: "documentNumber", header: "Doc No", size: 80 },
      { accessorKey: "status", header: "Status", size: 60 },
      { accessorKey: "sourceTarget", header: "Source/Target", size: 150 },
      {
        accessorKey: "amount",
        header: "Amount",
        size: 90,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(undefined, { minimumFractionDigits: 2 }),
      },
      {
        accessorKey: "runningBalance",
        header: "Balance",
        size: 90,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(undefined, { minimumFractionDigits: 2 }),
      },
    ],
    [],
  );

  const isLoading = isHeaderLoading || isLinesLoading;

  const table = useApparelProTable<GeneralStockMovementReportLine>({
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
            Stock Movement Report (General Inventory)
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
              label="Stores"
              size="small"
              fullWidth
              value={selectedStore}
              onChange={(e) => handleStoreChange(e.target.value)}
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
              label="Item"
              size="small"
              fullWidth
              value={selectedItemCode}
              onChange={(e) => setSelectedItemCode(e.target.value)}
              disabled={!selectedStore || isItemsLoading}
            >
              {itemsList.map((item) => (
                <MenuItem key={item.itemCode} value={item.itemCode}>
                  {item.itemCode} — {item.description}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
              disabled={!selectedStore || !selectedItemCode}
              fullWidth
            >
              Load
            </Button>
          </Grid>
        </Grid>

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Select a Store, Item, Month and Year, then click Load.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? "No transactions for Item in given month."}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile label="Item" value={header ? `${header.itemCode} - ${header.itemDescription}` : undefined} loading={isLoading} size={{ xs: 12, sm: 12, md: 6, lg: 6 }} />
              <KpiTile
                label="Period"
                value={header ? `${MONTH_NAMES[header.month - 1]} ${header.year}` : undefined}
                loading={isLoading}
                size={{ xs: 12, sm: 4, md: 2, lg: 2 }}
              />
              <KpiTile label="B/F Balance" value={header?.broughtForwardBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} loading={isLoading} size={{ xs: 12, sm: 4, md: 2, lg: 2 }} />
              <KpiTile label="C/F Balance" value={header?.carriedForwardBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} loading={isLoading} color="#60a5fa" size={{ xs: 12, sm: 4, md: 2, lg: 2 }} />
            </Grid>
            <MaterialReactTable table={table} />
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>
    </Box>
  );
}
