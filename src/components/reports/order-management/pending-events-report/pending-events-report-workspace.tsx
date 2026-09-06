import { useState } from "react";
import { Alert, Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
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
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
} from "../../../../themes/workspace-theme";

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
            Pending Events
          </Typography>
        </Box>

        <PendingEventsReportHeader onScopeChange={setScope} />

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
            disabled={!report || isLoading || isDownloading}
            sx={primaryActionButtonSx}
          >
            <span style={themedButtonLabelStyle}>
              {isDownloading ? "Generating..." : "Download PDF"}
            </span>
          </Button>
        </Box>

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
      </Paper>
    </Box>
  );
}
