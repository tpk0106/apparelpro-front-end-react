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

import OutstandingPurchaseOrderListReportHeader from "./outstanding-purchase-order-list-report-header";
import OutstandingPurchaseOrderListReportDisplay from "./outstanding-purchase-order-list-report-display";
import {
  useGetOutstandingPurchaseOrderListReportDetailsQuery,
  useDownloadOutstandingPurchaseOrderListReportPdfMutation,
} from "../../../../tanstack-hooks/outstanding-purchase-order-list-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";
import type { OutstandingPurchaseOrderListReportQueryParams } from "../../../../services/reports/order-management/outstanding-purchase-order-list-report.service";

// Stable placeholder used only while no scope is submitted (the query is disabled via
// `isReady` at that point, so this object's contents never reach the network) - same
// pattern as the other reports' EMPTY_SCOPE constants.
const EMPTY_SCOPE: OutstandingPurchaseOrderListReportQueryParams = {
  startDate: "",
  endDate: "",
  basisCode: null,
};

export default function OutstandingPurchaseOrderListReportWorkspace() {
  const [scope, setScope] =
    useState<OutstandingPurchaseOrderListReportQueryParams | null>(null);

  const isReady = !!scope;

  const {
    data: report,
    isFetching: isLoading,
    isError,
    error,
  } = useGetOutstandingPurchaseOrderListReportDetailsQuery(
    scope ?? EMPTY_SCOPE,
    isReady,
  );

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadOutstandingPurchaseOrderListReportPdfMutation();

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
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", color: "#1a237e" }}
        >
          List of Outstanding P/O's
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

      <OutstandingPurchaseOrderListReportHeader onScopeLock={setScope} />

      {!isReady ? (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
        >
          <Typography variant="body2">
            Select a Start Date and End Date above, then click "View Report".
          </Typography>
        </Paper>
      ) : isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" variant="outlined">
          {error?.message ??
            "Failed to load the Outstanding P/O List Report for the given criteria."}
        </Alert>
      ) : report ? (
        <OutstandingPurchaseOrderListReportDisplay report={report} />
      ) : null}
    </Box>
  );
}
