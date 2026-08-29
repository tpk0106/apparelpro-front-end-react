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
  useGetGeneralStockReorderReportHeaderQuery,
  useGetGeneralStockReorderReportLinesQuery,
  useDownloadGeneralStockReorderReportPdfMutation,
} from "../../../tanstack-hooks/general-inventory/general-stock-reorder-report.hooks";
import type { GeneralStockReorderReportLine } from "../../../interfaces/general-inventory/general-stock-reorder-report.types";
import type { AppError } from "../../../auth/axiosClient";

// Replicates GI_ROL.PRG's "STOCK RE-ORDER REPORT" - a current-snapshot listing
// straight off GeneralStockMasters for a Store, filtered to QtyInHand <= ReorderLevel.
export default function GeneralStockReorderReportWorkspace() {
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [searchedStore, setSearchedStore] = useState<string | null>(null);

  const { data: storesList = [], isLoading: isStoresLoading } = useGetGeneralStoresQuery();

  const isReady = !!searchedStore;

  const {
    data: header,
    isLoading: isHeaderLoading,
    isError,
    error,
  } = useGetGeneralStockReorderReportHeaderQuery({ storeCode: searchedStore ?? "" }, isReady);
  const { data: lines = [], isLoading: isLinesLoading } = useGetGeneralStockReorderReportLinesQuery(
    { storeCode: searchedStore ?? "" },
    isReady && !isError,
  );
  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadGeneralStockReorderReportPdfMutation();

  const handleLoad = () => {
    if (!selectedStore) return;
    setSearchedStore(selectedStore);
  };

  const handleDownloadPdf = async () => {
    if (!searchedStore) return;
    try {
      await downloadPdf({ storeCode: searchedStore });
    } catch (err) {
      const appError = err as AppError;
      toast.error(appError?.message ?? "Failed to generate the PDF.");
    }
  };

  const columns = useMemo<MRT_ColumnDef<GeneralStockReorderReportLine>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 120 },
      { accessorKey: "description", header: "Description", size: 200 },
      { accessorKey: "unit", header: "Unit", size: 55, enableSorting: false, enableColumnFilter: false },
      {
        accessorKey: "averagePrice",
        header: "Ave. Price",
        size: 90,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(undefined, { minimumFractionDigits: 2 }),
      },
      {
        accessorKey: "qtyInHand",
        header: "Qty In Hand",
        size: 95,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(undefined, { minimumFractionDigits: 2 }),
      },
      {
        accessorKey: "reorderLevel",
        header: "Re-order Level",
        size: 100,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(undefined, { minimumFractionDigits: 2 }),
      },
      {
        accessorKey: "reorderQuantity",
        header: "Re-order Qty",
        size: 95,
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(undefined, { minimumFractionDigits: 2 }),
      },
    ],
    [],
  );

  const isLoading = isHeaderLoading || isLinesLoading;

  const table = useApparelProTable<GeneralStockReorderReportLine>({
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
            Stock Re-order Report (General Inventory)
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
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Select a Store, then click Load.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? "No Items for given Stores."}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile label="Stores" value={header?.storeDescription} loading={isLoading} size={{ xs: 12, sm: 6, md: 8, lg: 8 }} />
              <KpiTile label="Items at/below Re-order Level" value={header?.totalLineItems} loading={isLoading} color="#60a5fa" size={{ xs: 12, sm: 6, md: 4, lg: 4 }} />
            </Grid>
            <MaterialReactTable table={table} />
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>
    </Box>
  );
}
