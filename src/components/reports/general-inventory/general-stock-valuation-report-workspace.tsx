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
  useGetGeneralStockValuationReportHeaderQuery,
  useGetGeneralStockValuationReportLinesQuery,
  useDownloadGeneralStockValuationReportPdfMutation,
} from "../../../tanstack-hooks/general-inventory/general-stock-valuation-report.hooks";
import type { GeneralStockValuationReportLine } from "../../../interfaces/general-inventory/general-stock-valuation-report.types";
import type { AppError } from "../../../auth/axiosClient";

// Replicates GI_SVAL.PRG's "STOCK VALUATION REPORT" - a current-snapshot listing
// straight off GeneralStockMasters for a Store and Item Code range, no month/date
// filter (unlike Stock Status/Movement, this needs no transaction replay).
export default function GeneralStockValuationReportWorkspace() {
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [fromItemCode, setFromItemCode] = useState<string>("");
  const [toItemCode, setToItemCode] = useState<string>("");

  const [searchedParams, setSearchedParams] = useState<{
    storeCode: string;
    fromItemCode: string;
    toItemCode: string;
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
  } = useGetGeneralStockValuationReportHeaderQuery(
    searchedParams ?? { storeCode: "", fromItemCode: "", toItemCode: "" },
    isReady,
  );
  const { data: lines = [], isLoading: isLinesLoading } = useGetGeneralStockValuationReportLinesQuery(
    searchedParams ?? { storeCode: "", fromItemCode: "", toItemCode: "" },
    isReady && !isError,
  );
  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadGeneralStockValuationReportPdfMutation();

  const handleStoreChange = (storeCode: string) => {
    setSelectedStore(storeCode);
    setFromItemCode("");
    setToItemCode("");
  };

  const handleLoad = () => {
    if (!selectedStore || !fromItemCode || !toItemCode) return;
    setSearchedParams({ storeCode: selectedStore, fromItemCode, toItemCode });
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

  const columns = useMemo<MRT_ColumnDef<GeneralStockValuationReportLine>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 100 },
      { accessorKey: "description", header: "Description", size: 140 },
      { accessorKey: "unit", header: "Unit", size: 45, enableSorting: false, enableColumnFilter: false },
      {
        accessorKey: "qtyInHand",
        header: "Qty in Hand",
        size: 80,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(undefined, { minimumFractionDigits: 2 }),
      },
      {
        accessorKey: "value",
        header: "Value",
        size: 90,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(undefined, { minimumFractionDigits: 2 }),
      },
      {
        accessorKey: "damagedQuantity",
        header: "Damaged",
        size: 70,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(undefined, { minimumFractionDigits: 2 }),
      },
      {
        accessorKey: "reorderLevel",
        header: "R/O Level",
        size: 75,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(undefined, { minimumFractionDigits: 2 }),
      },
      {
        accessorKey: "reorderQuantity",
        header: "R/O Qty",
        size: 70,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(undefined, { minimumFractionDigits: 2 }),
      },
      {
        accessorKey: "minStock",
        header: "Min Stock",
        size: 75,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(undefined, { minimumFractionDigits: 2 }),
      },
      {
        accessorKey: "maxStock",
        header: "Max Stock",
        size: 75,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(undefined, { minimumFractionDigits: 2 }),
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        size: 80,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(undefined, { minimumFractionDigits: 4 }),
      },
      { accessorKey: "currency", header: "Curr", size: 55, enableSorting: false, enableColumnFilter: false },
    ],
    [],
  );

  const isLoading = isHeaderLoading || isLinesLoading;

  const table = useApparelProTable<GeneralStockValuationReportLine>({
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
            Stock Valuation Report (General Inventory)
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3, alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
              label="From Item"
              size="small"
              fullWidth
              value={fromItemCode}
              onChange={(e) => setFromItemCode(e.target.value)}
              disabled={!selectedStore || isItemsLoading}
            >
              {itemsList.map((item) => (
                <MenuItem key={item.itemCode} value={item.itemCode}>
                  {item.itemCode} — {item.description}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="To Item"
              size="small"
              fullWidth
              value={toItemCode}
              onChange={(e) => setToItemCode(e.target.value)}
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
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleLoad}
              disabled={!selectedStore || !fromItemCode || !toItemCode}
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
            Select a Store and an Item Code range (From/To), then click Load.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? "Unable to load the Stock Valuation Report."}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile label="Stores" value={header?.storeDescription} loading={isLoading} size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
              <KpiTile
                label="Item Range"
                value={header ? `${header.fromItemCode} to ${header.toItemCode}` : undefined}
                loading={isLoading}
                size={{ xs: 12, sm: 12, md: 6, lg: 6 }}
              />
              <KpiTile label="Line Items" value={header?.totalLineItems} loading={isLoading} size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
              <KpiTile label="Total Value" value={header?.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} loading={isLoading} color="#60a5fa" size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
            </Grid>
            <MaterialReactTable table={table} />
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>
    </Box>
  );
}
