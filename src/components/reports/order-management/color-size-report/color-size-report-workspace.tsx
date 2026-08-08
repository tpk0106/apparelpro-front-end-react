import { useState } from "react";
import { Alert, Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { toast } from "react-toastify";

import ColorSizeReportHeader from "./color-size-report-header";
import ColorSizeReportDisplay from "./color-size-report-display";
import {
  useGetColorSizeReportDetailsQuery,
  useDownloadColorSizeReportPdfMutation,
} from "../../../../tanstack-hooks/color-size-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";
import type { ColorSizeReportScopeContext } from "./color-size-report.types";

const EMPTY_SCOPE: ColorSizeReportScopeContext = {
  buyerCode: 0,
  order: "",
};

export default function ColorSizeReportWorkspace() {
  const [scope, setScope] = useState<ColorSizeReportScopeContext | null>(
    null,
  );

  const isReady = !!scope;

  const {
    data: report,
    isFetching: isLoading,
    isError,
    error,
  } = useGetColorSizeReportDetailsQuery(scope ?? EMPTY_SCOPE, isReady);

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadColorSizeReportPdfMutation();

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
          Colour/Size Report
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

      <ColorSizeReportHeader onScopeLock={setScope} />

      {!isReady ? (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
        >
          <Typography variant="body2">
            Select a Buyer and Purchase Order above to display its Colour/Size Report.
          </Typography>
        </Paper>
      ) : isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" variant="outlined">
          {error?.message ??
            "Failed to load the Colour/Size Report for the selected Buyer/Order."}
        </Alert>
      ) : report ? (
        <ColorSizeReportDisplay report={report} />
      ) : null}
    </Box>
  );
}
