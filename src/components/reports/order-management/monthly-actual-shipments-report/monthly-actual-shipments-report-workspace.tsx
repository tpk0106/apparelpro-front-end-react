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
          Monthly Actual Shipments
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

      <MonthlyActualShipmentsReportHeader onScopeLock={setScope} />

      {!isReady ? (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
        >
          <Typography variant="body2">
            Select a Month and Year above, then press "Generate Report" to
            display the Monthly Actual Shipments Report.
          </Typography>
        </Paper>
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
    </Box>
  );
}
