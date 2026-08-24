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

import PostOrderCostSheetReportHeader from "./post-order-cost-sheet-report-header";
import PostOrderCostSheetReportDisplay from "./post-order-cost-sheet-report-display";
import {
  useGetPostOrderCostSheetReportDetailsQuery,
  useDownloadPostOrderCostSheetReportPdfMutation,
} from "../../../../tanstack-hooks/post-order-cost-sheet-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";
import type { PostOrderCostSheetReportScopeContext } from "./post-order-cost-sheet-report.types";

export default function PostOrderCostSheetReportWorkspace() {
  const [scope, setScope] = useState<PostOrderCostSheetReportScopeContext | null>(null);

  const isReady = !!scope;

  const {
    data: report,
    isFetching: isLoading,
    isError,
    error,
  } = useGetPostOrderCostSheetReportDetailsQuery(scope, isReady);

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadPostOrderCostSheetReportPdfMutation();

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
          Post Order Cost Sheet
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

      <PostOrderCostSheetReportHeader onScopeLock={setScope} />

      {!isReady ? (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
        >
          <Typography variant="body2">
            Select a Buyer and Order above, then press "Generate Report" to
            display the Post Order Cost Sheet.
          </Typography>
        </Paper>
      ) : isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="info" variant="outlined">
          {error?.message ?? "No Transactions entered for above Order."}
        </Alert>
      ) : report ? (
        <PostOrderCostSheetReportDisplay report={report} />
      ) : null}
    </Box>
  );
}
