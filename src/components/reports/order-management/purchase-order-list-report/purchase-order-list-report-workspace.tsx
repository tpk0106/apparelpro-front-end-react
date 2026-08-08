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

import PurchaseOrderListReportHeader from "./purchase-order-list-report-header";
import PurchaseOrderListReportDisplay from "./purchase-order-list-report-display";
import {
  useGetPurchaseOrderListReportDetailsQuery,
  useDownloadPurchaseOrderListReportPdfMutation,
} from "../../../../tanstack-hooks/purchase-order-list-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";

export default function PurchaseOrderListReportWorkspace() {
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState<
    string | null
  >(null);

  const isReady = !!purchaseOrderNumber;

  const {
    data: report,
    isFetching: isLoading,
    isError,
    error,
  } = useGetPurchaseOrderListReportDetailsQuery(
    purchaseOrderNumber ?? "",
    isReady,
  );

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadPurchaseOrderListReportPdfMutation();

  const handleDownloadPdf = async () => {
    if (!purchaseOrderNumber) return;
    try {
      await downloadPdf(purchaseOrderNumber);
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
          Purchase Order List Report
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

      <PurchaseOrderListReportHeader onScopeLock={setPurchaseOrderNumber} />

      {!isReady ? (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
        >
          <Typography variant="body2">
            Select a Purchase Order No. above to display its Purchase Order
            List Report.
          </Typography>
        </Paper>
      ) : isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" variant="outlined">
          {error?.message ??
            "Failed to load the Purchase Order List Report for the selected Purchase Order No."}
        </Alert>
      ) : report ? (
        <PurchaseOrderListReportDisplay report={report} />
      ) : null}
    </Box>
  );
}
