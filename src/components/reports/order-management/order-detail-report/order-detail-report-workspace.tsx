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

import OrderDetailReportHeader from "./order-detail-report-header";
import OrderDetailReportDisplay from "./order-detail-report-display";
import {
  useGetOrderDetailReportDetailsQuery,
  useDownloadOrderDetailReportPdfMutation,
} from "../../../../tanstack-hooks/order-detail-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";
import type { OrderDetailReportScopeContext } from "./order-detail-report.types";

// Stable placeholder used only while no scope is selected (the query is disabled via
// `isReady` at that point, so this object's contents never reach the network) - kept
// as a module-level constant rather than an inline literal so its identity doesn't
// change on every render (same pattern as Trim Sheet Report's EMPTY_SCOPE).
const EMPTY_SCOPE: OrderDetailReportScopeContext = {
  buyerCode: 0,
  order: "",
};

export default function OrderDetailReportWorkspace() {
  const [scope, setScope] = useState<OrderDetailReportScopeContext | null>(
    null,
  );

  const isReady = !!scope;

  const {
    data: report,
    isFetching: isLoading,
    isError,
    error,
  } = useGetOrderDetailReportDetailsQuery(scope ?? EMPTY_SCOPE, isReady);

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadOrderDetailReportPdfMutation();

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
          Order Detail Report
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

      <OrderDetailReportHeader onScopeLock={setScope} />

      {!isReady ? (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
        >
          <Typography variant="body2">
            Select a Buyer and Purchase Order above to display its Order Detail
            Report.
          </Typography>
        </Paper>
      ) : isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" variant="outlined">
          {error?.message ??
            "Failed to load the Order Detail Report for the selected Buyer/Order."}
        </Alert>
      ) : report ? (
        <OrderDetailReportDisplay report={report} />
      ) : null}
    </Box>
  );
}
