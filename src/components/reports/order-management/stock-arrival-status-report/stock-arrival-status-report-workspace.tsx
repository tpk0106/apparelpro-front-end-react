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
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
} from "../../../../themes/workspace-theme";

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
            Stock Arrival Status
          </Typography>
        </Box>

        <StockArrivalStatusReportHeader onScopeLock={setScope} />

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
            Select a Buyer, Order, and As Of Date above to display the Stock
            Arrival Status Report.
          </Alert>
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
      </Paper>
    </Box>
  );
}
