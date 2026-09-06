import { useState } from "react";
import { Alert, Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { toast } from "react-toastify";

import ScheduledShipmentsReportHeader from "./scheduled-shipments-report-header";
import ScheduledShipmentsReportDisplay from "./scheduled-shipments-report-display";
import {
  useGetScheduledShipmentsReportDetailsQuery,
  useDownloadScheduledShipmentsReportPdfMutation,
} from "../../../../tanstack-hooks/scheduled-shipments-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";
import type { ScheduledShipmentsReportScopeContext } from "./scheduled-shipments-report.types";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
} from "../../../../themes/workspace-theme";

const EMPTY_SCOPE: ScheduledShipmentsReportScopeContext = {
  buyerCode: null,
  order: null,
};

export default function ScheduledShipmentsReportWorkspace() {
  const [scope, setScope] = useState<ScheduledShipmentsReportScopeContext>(EMPTY_SCOPE);

  const queryParams = {
    buyerCode: scope.buyerCode ?? undefined,
    order: scope.order ?? undefined,
  };

  const {
    data: report,
    isFetching: isLoading,
    isError,
    error,
  } = useGetScheduledShipmentsReportDetailsQuery(queryParams, true);

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadScheduledShipmentsReportPdfMutation();

  const handleDownloadPdf = async () => {
    try {
      await downloadPdf(queryParams);
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
            Scheduled Shipments Report
          </Typography>
        </Box>

        <ScheduledShipmentsReportHeader onScopeChange={setScope} />

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
            {error?.message ?? "No Schedule Shipment Details For Printing."}
          </Alert>
        ) : report ? (
          <ScheduledShipmentsReportDisplay report={report} />
        ) : null}
      </Paper>
    </Box>
  );
}
