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
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
} from "../../../../themes/workspace-theme";

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
            Cost of Production
          </Typography>
        </Box>

        <CostOfProductionReportHeader onScopeLock={setScope} />

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
            disabled={!isReady || !report || isLoading || isDownloading}
            sx={primaryActionButtonSx}
          >
            <span style={themedButtonLabelStyle}>
              {isDownloading ? "Generating..." : "Download PDF"}
            </span>
          </Button>
        </Box>

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Select a Buyer and Order above to display the Cost of Production
            Report.
          </Alert>
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
      </Paper>
    </Box>
  );
}
