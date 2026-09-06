import { useState } from "react";
import { Alert, Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { toast } from "react-toastify";

import YearSeasonOrdersReportHeader from "./year-season-orders-report-header";
import YearSeasonOrdersReportDisplay from "./year-season-orders-report-display";
import {
  useGetYearSeasonOrdersReportDetailsQuery,
  useDownloadYearSeasonOrdersReportPdfMutation,
} from "../../../../tanstack-hooks/year-season-orders-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";
import type { YearSeasonOrdersReportScopeContext } from "./year-season-orders-report.types";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
} from "../../../../themes/workspace-theme";

const EMPTY_SCOPE: YearSeasonOrdersReportScopeContext = {
  year: null,
  season: null,
};

export default function YearSeasonOrdersReportWorkspace() {
  const [scope, setScope] = useState<YearSeasonOrdersReportScopeContext>(EMPTY_SCOPE);

  const queryParams = {
    year: scope.year ?? undefined,
    season: scope.season ?? undefined,
  };

  const {
    data: report,
    isFetching: isLoading,
    isError,
    error,
  } = useGetYearSeasonOrdersReportDetailsQuery(queryParams, true);

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadYearSeasonOrdersReportPdfMutation();

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
            Year/Season Wise Orders
          </Typography>
        </Box>

        <YearSeasonOrdersReportHeader onScopeChange={setScope} />

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
            {error?.message ?? "No Details For Printing."}
          </Alert>
        ) : report ? (
          <YearSeasonOrdersReportDisplay report={report} />
        ) : null}
      </Paper>
    </Box>
  );
}
