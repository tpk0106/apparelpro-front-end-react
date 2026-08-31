import { useState } from "react";
import { Alert, Box, Button, Divider, Paper, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

import ArnPrintReportGrid from "./arn-print-report-grid";
import KpiTile from "../../../common/kpi-tile";
import {
  useDownloadArnPrintPdfMutation,
  useGetArnPrintDetailsQuery,
} from "../../../../tanstack-hooks/arn-print-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";

export default function ArnPrintReportWorkspace() {
  const [arnNumberInput, setArnNumberInput] = useState<string>("");
  const [searchedArnNumber, setSearchedArnNumber] = useState<string>("");

  const isReady = searchedArnNumber.trim().length > 0;

  const {
    data: details,
    isLoading,
    isError,
    error,
  } = useGetArnPrintDetailsQuery(searchedArnNumber, isReady);

  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadArnPrintPdfMutation();

  const handleLoad = () => {
    const trimmed = arnNumberInput.trim();
    if (!trimmed) return;
    setSearchedArnNumber(trimmed);
  };

  const handleDownloadPdf = async () => {
    if (!searchedArnNumber) return;
    try {
      await downloadPdf(searchedArnNumber);
    } catch (err) {
      const appError = err as AppError;
      toast.error(appError?.message ?? "Failed to generate the PDF.");
    }
  };

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Paper elevation={3} sx={{ p: 3, borderTop: `4px solid ${DASHBOARD_COLORS.accent}`, backgroundColor: DASHBOARD_COLORS.cardBg }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Additional Goods Receipt Note — Print
          </Typography>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownloadPdf}
            disabled={!isReady || !details || isDownloading}
          >
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="ARN No"
              size="small"
              fullWidth
              value={arnNumberInput}
              onChange={(e) => setArnNumberInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLoad();
              }}
              placeholder="e.g. 000123"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleLoad}
              disabled={!arnNumberInput.trim()}
              fullWidth
            >
              Load
            </Button>
          </Grid>
        </Grid>

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Enter an ARN No and click Load to preview and print a committed Additional Goods Receipt Note.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? `ARN No '${searchedArnNumber}' not found.`}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile label="ARN No" value={details?.header.arnNumber} loading={isLoading} size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
              <KpiTile label="Basis" value={details?.header.storeCode} loading={isLoading} size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
              <KpiTile label="Sub Contractor" value={details?.header.subContractorCode} loading={isLoading} size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
              <KpiTile label="Currency" value={details?.header.currency} loading={isLoading} size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
              <KpiTile
                label="Date"
                value={details?.header?.transactionDate && format(parseISO(details.header.transactionDate), "dd-MMM-yyyy")}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 2, lg: 2 }}
              />
              <KpiTile
                label="Total Value"
                value={details ? details.header.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 }) : undefined}
                loading={isLoading}
                color="#60a5fa"
                size={{ xs: 12, sm: 6, md: 2, lg: 2 }}
              />
            </Grid>
            <ArnPrintReportGrid data={details?.lines ?? []} isLoading={isLoading} isError={isError} />
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>
    </Box>
  );
}
