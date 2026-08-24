import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { toast } from "react-toastify";

import StockArrivalStatusReportHeader from "./stock-arrival-status-report-header";
import StockArrivalStatusReportDisplay from "./stock-arrival-status-report-display";
import {
  useGetStockArrivalStatusReportDetailsQuery,
  useDownloadStockArrivalStatusReportPdfMutation,
} from "../../../../tanstack-hooks/stock-arrival-status-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";
import type { StockArrivalStatusReportScopeContext } from "./stock-arrival-status-report.types";

const EMPTY_SCOPE: StockArrivalStatusReportScopeContext = {
  buyerCode: 0,
  order: "",
  asOfDate: "",
};

export default function StockArrivalStatusReportWorkspace() {
  const [scope, setScope] = useState<StockArrivalStatusReportScopeContext | null>(
    null,
  );

  const isReady = !!scope;

  const {
    data: report,
    isFetching: isLoading,
    isError,
    error,
  } = useGetStockArrivalStatusReportDetailsQuery(scope ?? EMPTY_SCOPE, isReady);

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadStockArrivalStatusReportPdfMutation();

  const handleDownloadPdf = async () => {
    if (!scope) return;
    try {
      await downloadPdf(scope);
    } catch (err) {
      const appError = err as AppError;
      toast.error(appError?.message ?? "Failed to generate the PDF.");
    }
  };

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1a237e" }}>
          Stock Arrival Status
        </Typography>
        <Button
          variant="contained"
          startIcon={
            isDownloading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <PictureAsPdfIcon />
            )
          }
          onClick={handleDownloadPdf}
          disabled={!isReady || !report || isLoading || isDownloading}
        >
          {isDownloading ? "Generating..." : "Print (PDF)"}
        </Button>
      </Box>

      <StockArrivalStatusReportHeader onScopeLock={setScope} />

      {!isReady ? (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
        >
          <Typography variant="body2">
            Select a Buyer, Order, and As Of Date above to display the Stock
            Arrival Status Report.
          </Typography>
        </Paper>
      ) : isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="info" variant="outlined">
          {error?.message ?? "No Trimmings Entered for above Order."}
        </Alert>
      ) : report ? (
        <StockArrivalStatusReportDisplay report={report} />
      ) : null}
    </Box>
  );
}
