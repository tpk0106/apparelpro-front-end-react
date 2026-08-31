import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

import { useApparelProTable } from "../../../themes/useApparelProTable";
import KpiTile from "../../common/kpi-tile";
import {
  useGetGeneralPurchaseOrderListReportHeaderQuery,
  useGetGeneralPurchaseOrderListReportLinesQuery,
  useDownloadGeneralPurchaseOrderListReportPdfMutation,
} from "../../../tanstack-hooks/general-inventory/general-purchase-order-list-report.hooks";
import type { GeneralPurchaseOrderListReportLine } from "../../../interfaces/general-inventory/general-purchase-order-list-report.types";
import type { AppError } from "../../../auth/axiosClient";

// Replicates GI_PLIST.PRG's "LIST OF P/O's (General)" - a flat GeneralPurchaseOrders
// listing for a date range. No transaction replay - a P/O never moves stock on its own.
export default function GeneralPurchaseOrderListReportWorkspace() {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [searchedParams, setSearchedParams] = useState<{ fromDate: string; toDate: string } | null>(null);

  const isReady = !!searchedParams;

  const {
    data: header,
    isLoading: isHeaderLoading,
    isError,
    error,
  } = useGetGeneralPurchaseOrderListReportHeaderQuery(searchedParams ?? { fromDate: "", toDate: "" }, isReady);
  const { data: lines = [], isLoading: isLinesLoading } = useGetGeneralPurchaseOrderListReportLinesQuery(
    searchedParams ?? { fromDate: "", toDate: "" },
    isReady && !isError,
  );
  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadGeneralPurchaseOrderListReportPdfMutation();

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

  const columns = useMemo<MRT_ColumnDef<GeneralPurchaseOrderListReportLine>[]>(
    () => [
      { accessorKey: "poNumber", header: "P/O No", size: 80 },
      { accessorKey: "orderDate", header: "Date", size: 90, Cell: ({ cell }) => cell.getValue<string | null>() ?? "" },
      { accessorKey: "orderTime", header: "Time", size: 75, enableColumnFilter: false, Cell: ({ cell }) => cell.getValue<string | null>() ?? "" },
      { accessorKey: "supplierName", header: "Supplier", size: 200 },
      { accessorKey: "basisCode", header: "Basis", size: 65, Cell: ({ cell }) => cell.getValue<string | null>() ?? "" },
      { accessorKey: "proformaInvoiceNo", header: "PI No", size: 100, Cell: ({ cell }) => cell.getValue<string | null>() ?? "" },
      { accessorKey: "currencyCode", header: "Curr", size: 60, enableSorting: false, Cell: ({ cell }) => cell.getValue<string | null>() ?? "" },
      { accessorKey: "preparedBy", header: "Prepared By", size: 160 },
    ],
    [],
  );

  const isLoading = isHeaderLoading || isLinesLoading;

  const table = useApparelProTable<GeneralPurchaseOrderListReportLine>({
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
            List of P/O's (General Inventory)
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
              type="date"
              label="From Date"
              size="small"
              fullWidth
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
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
            Select a From/To Date, then click Load.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? "Given Date Range not found."}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile
                label="Date Range"
                value={header ? `${header.fromDate} to ${header.toDate}` : undefined}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 8, lg: 8 }}
              />
              <KpiTile label="P/O's Listed" value={header?.totalLineItems} loading={isLoading} color="#60a5fa" size={{ xs: 12, sm: 6, md: 4, lg: 4 }} />
            </Grid>
            <MaterialReactTable table={table} />
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>
    </Box>
  );
}
