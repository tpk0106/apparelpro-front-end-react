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

import MonthlyActualShipmentsReportHeader from "./monthly-actual-shipments-report-header";
import MonthlyActualShipmentsReportDisplay from "./monthly-actual-shipments-report-display";
import {
  useGetMonthlyActualShipmentsReportDetailsQuery,
  useDownloadMonthlyActualShipmentsReportPdfMutation,
} from "../../../../tanstack-hooks/monthly-actual-shipments-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";
import type { MonthlyActualShipmentsReportScopeContext } from "./monthly-actual-shipments-report.types";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
} from "../../../../themes/workspace-theme";

export default function MonthlyActualShipmentsReportWorkspace() {
  const [scope, setScope] = useState<MonthlyActualShipmentsReportScopeContext | null>(null);

  const isReady = !!scope;

  const {
    data: report,
    isFetching: isLoading,
    isError,
    error,
  } = useGetMonthlyActualShipmentsReportDetailsQuery(scope, isReady);

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadMonthlyActualShipmentsReportPdfMutation();

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
            Monthly Actual Shipments
          </Typography>
        </Box>

        <MonthlyActualShipmentsReportHeader onScopeLock={setScope} />

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
            Select a Month and Year above, then press "Generate Report" to
            display the Monthly Actual Shipments Report.
          </Alert>
        ) : isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="info" variant="outlined">
            {error?.message ?? "No shipments details for printing."}
          </Alert>
        ) : report ? (
          <MonthlyActualShipmentsReportDisplay report={report} />
        ) : null}
      </Paper>
    </Box>
  );
}
