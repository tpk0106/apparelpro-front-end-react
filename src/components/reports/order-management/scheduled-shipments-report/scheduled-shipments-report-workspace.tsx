import { useState } from "react";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
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
          Scheduled Shipments Report
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

      <ScheduledShipmentsReportHeader onScopeChange={setScope} />

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
    </Box>
  );
}
