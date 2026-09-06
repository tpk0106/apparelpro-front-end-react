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
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
} from "../../../../themes/workspace-theme";

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
            List of Outstanding P/O's
          </Typography>
        </Box>

        <OutstandingPurchaseOrderListReportHeader onScopeLock={setScope} />

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
            Select a Start Date and End Date above, then click "View Report".
          </Alert>
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
      </Paper>
    </Box>
  );
}
