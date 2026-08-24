import { useState } from "react";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
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
          Year/Season Wise Orders
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

      <YearSeasonOrdersReportHeader onScopeChange={setScope} />

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
    </Box>
  );
}
