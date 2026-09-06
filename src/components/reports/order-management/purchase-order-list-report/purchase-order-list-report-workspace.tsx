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
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
} from "../../../../themes/workspace-theme";

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
    <Box sx={{ width: "95%", mx: "auto", p: 1 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          backgroundColor: DASHBOARD_COLORS.pageBg,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h5" sx={workspaceHeadingSx}>
            Purchase Order List Report
          </Typography>
        </Box>

        <PurchaseOrderListReportHeader onScopeLock={setPurchaseOrderNumber} />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
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
            sx={primaryActionButtonSx}
          >
            <span style={themedButtonLabelStyle}>
              {isDownloading ? "Generating..." : "Download PDF"}
            </span>
          </Button>
        </Box>

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Select a Purchase Order No. above to display its Purchase Order
            List Report.
          </Alert>
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
      </Paper>
    </Box>
  );
}
