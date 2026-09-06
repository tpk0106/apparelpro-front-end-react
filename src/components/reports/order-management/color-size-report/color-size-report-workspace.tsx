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
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
} from "../../../../themes/workspace-theme";

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
            Colour/Size Report
          </Typography>
        </Box>

        <ColorSizeReportHeader onScopeLock={setScope} />

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
            Select a Buyer and Purchase Order above to display its Colour/Size Report.
          </Alert>
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
      </Paper>
    </Box>
  );
}
