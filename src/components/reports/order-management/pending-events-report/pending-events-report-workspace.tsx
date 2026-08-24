import { useState } from "react";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { toast } from "react-toastify";

import PendingEventsReportHeader from "./pending-events-report-header";
import PendingEventsReportDisplay from "./pending-events-report-display";
import {
  useGetPendingEventsReportDetailsQuery,
  useDownloadPendingEventsReportPdfMutation,
} from "../../../../tanstack-hooks/pending-events-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";
import type { PendingEventsReportScopeContext } from "./pending-events-report.types";

const todayScope = (): PendingEventsReportScopeContext => ({
  asOfDate: new Date().toISOString().slice(0, 10),
});

export default function PendingEventsReportWorkspace() {
  const [scope, setScope] = useState<PendingEventsReportScopeContext>(todayScope);

  const {
    data: report,
    isFetching: isLoading,
    isError,
    error,
  } = useGetPendingEventsReportDetailsQuery(scope, true);

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadPendingEventsReportPdfMutation();

  const handleDownloadPdf = async () => {
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
          Pending Events
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
          disabled={!report || isLoading || isDownloading}
        >
          {isDownloading ? "Generating..." : "Print (PDF)"}
        </Button>
      </Box>

      <PendingEventsReportHeader onScopeChange={setScope} />

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="info" variant="outlined">
          {error?.message ?? "No Pending Events For Printing."}
        </Alert>
      ) : report ? (
        <PendingEventsReportDisplay report={report} />
      ) : null}
    </Box>
  );
}
