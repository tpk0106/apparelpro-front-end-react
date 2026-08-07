import { useState } from "react";
import { Alert, Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { toast } from "react-toastify";

import TrimSheetReportHeader from "./trim-sheet-report-header";
import TrimSheetReportDisplay from "./trim-sheet-report-display";
import {
  useGetTrimSheetReportDetailsQuery,
  useDownloadTrimSheetReportPdfMutation,
} from "../../tanstack-hooks/trim-sheet-report.hooks";
import type { AppError } from "../../auth/axiosClient";
import type { TrimSheetReportScopeContext } from "./trim-sheet-report.types";

// Stable placeholder used only while no scope is selected (the query is disabled
// via `isReady` at that point, so this object's contents never reach the network) -
// kept as a module-level constant rather than an inline literal so its identity
// doesn't change on every render.
const EMPTY_SCOPE: TrimSheetReportScopeContext = {
  buyerCode: 0,
  order: "",
  typeCode: 0,
  styleCode: "",
};

export default function TrimSheetReportWorkspace() {
  const [scope, setScope] = useState<TrimSheetReportScopeContext | null>(
    null,
  );

  const isReady = !!scope;

  const {
    data: report,
    isFetching: isLoading,
    isError,
    error,
  } = useGetTrimSheetReportDetailsQuery(
    scope ?? EMPTY_SCOPE,
    isReady,
  );

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadTrimSheetReportPdfMutation();

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
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", color: "#1a237e" }}
        >
          Trim Sheet Report
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

      <TrimSheetReportHeader onScopeLock={setScope} />

      {!isReady ? (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
        >
          <Typography variant="body2">
            Select a Buyer, Purchase Order, Garment Type, and Style above to
            display its Trim Sheet Report.
          </Typography>
        </Paper>
      ) : isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" variant="outlined">
          {error?.message ??
            "Failed to load the Trim Sheet Report for the selected style."}
        </Alert>
      ) : report ? (
        <TrimSheetReportDisplay report={report} />
      ) : null}
    </Box>
  );
}
