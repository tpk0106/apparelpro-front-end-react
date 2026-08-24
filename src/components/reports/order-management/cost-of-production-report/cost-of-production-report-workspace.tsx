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

import CostOfProductionReportHeader from "./cost-of-production-report-header";
import CostOfProductionReportDisplay from "./cost-of-production-report-display";
import {
  useGetCostOfProductionReportDetailsQuery,
  useDownloadCostOfProductionReportPdfMutation,
} from "../../../../tanstack-hooks/cost-of-production-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";
import type { CostOfProductionReportScopeContext } from "./cost-of-production-report.types";

const EMPTY_SCOPE: CostOfProductionReportScopeContext = {
  buyerCode: 0,
  order: "",
};

export default function CostOfProductionReportWorkspace() {
  const [scope, setScope] = useState<CostOfProductionReportScopeContext | null>(
    null,
  );

  const isReady = !!scope;

  const {
    data: report,
    isFetching: isLoading,
    isError,
    error,
  } = useGetCostOfProductionReportDetailsQuery(scope ?? EMPTY_SCOPE, isReady);

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadCostOfProductionReportPdfMutation();

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
          Cost of Production
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

      <CostOfProductionReportHeader onScopeLock={setScope} />

      {!isReady ? (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
        >
          <Typography variant="body2">
            Select a Buyer and Order above to display the Cost of Production
            Report.
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
        <CostOfProductionReportDisplay report={report} />
      ) : null}
    </Box>
  );
}
