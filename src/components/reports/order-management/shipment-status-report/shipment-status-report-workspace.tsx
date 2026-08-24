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

import ShipmentStatusReportHeader from "./shipment-status-report-header";
import ShipmentStatusReportDisplay from "./shipment-status-report-display";
import {
  useGetShipmentStatusReportDetailsQuery,
  useDownloadShipmentStatusReportPdfMutation,
} from "../../../../tanstack-hooks/shipment-status-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";
import type { ShipmentStatusReportScopeContext } from "./shipment-status-report.types";

// Stable placeholder used only while no scope is selected (the query is disabled via
// `isReady` at that point, so this object's contents never reach the network) - same
// pattern as Order Detail Report's EMPTY_SCOPE.
const EMPTY_SCOPE: ShipmentStatusReportScopeContext = {
  buyerCode: 0,
  order: "",
};

export default function ShipmentStatusReportWorkspace() {
  const [scope, setScope] = useState<ShipmentStatusReportScopeContext | null>(
    null,
  );

  const isReady = !!scope;

  const {
    data: report,
    isFetching: isLoading,
    isError,
    error,
  } = useGetShipmentStatusReportDetailsQuery(scope ?? EMPTY_SCOPE, isReady);

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadShipmentStatusReportPdfMutation();

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
          Shipment Status Report
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

      <ShipmentStatusReportHeader onScopeLock={setScope} />

      {!isReady ? (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
        >
          <Typography variant="body2">
            Select a Buyer and Order above to display its Shipment Status
            Report.
          </Typography>
        </Paper>
      ) : isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="info" variant="outlined">
          {error?.message ?? "No Shipment Status Details For Printing."}
        </Alert>
      ) : report ? (
        <ShipmentStatusReportDisplay report={report} />
      ) : null}
    </Box>
  );
}
