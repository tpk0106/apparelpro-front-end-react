import { useState } from "react";
import { Alert, Box, Button, Divider, Paper, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

import AinPrintReportGrid from "./ain-print-report-grid";
import KpiTile from "../../../common/kpi-tile";
import {
  useDownloadAinPrintPdfMutation,
  useGetAinPrintDetailsQuery,
} from "../../../../tanstack-hooks/ain-print-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";

export default function AinPrintReportWorkspace() {
  const [ainNumberInput, setAinNumberInput] = useState<string>("");
  const [searchedAinNumber, setSearchedAinNumber] = useState<string>("");

  const isReady = searchedAinNumber.trim().length > 0;

  const {
    data: details,
    isLoading,
    isError,
    error,
  } = useGetAinPrintDetailsQuery(searchedAinNumber, isReady);

  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadAinPrintPdfMutation();

  const handleLoad = () => {
    const trimmed = ainNumberInput.trim();
    if (!trimmed) return;
    setSearchedAinNumber(trimmed);
  };

  const handleDownloadPdf = async () => {
    if (!searchedAinNumber) return;
    try {
      await downloadPdf(searchedAinNumber);
    } catch (err) {
      const appError = err as AppError;
      toast.error(appError?.message ?? "Failed to generate the PDF.");
    }
  };

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Paper elevation={3} sx={{ p: 3, borderTop: "4px solid #60a5fa", backgroundColor: "#f9f9f9" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Additional Issue Note — Print
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
              label="AIN No"
              size="small"
              fullWidth
              value={ainNumberInput}
              onChange={(e) => setAinNumberInput(e.target.value)}
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
              disabled={!ainNumberInput.trim()}
              fullWidth
            >
              Load
            </Button>
          </Grid>
        </Grid>

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Enter an AIN No and click Load to preview and print a committed Additional Issue Note.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? `AIN No '${searchedAinNumber}' not found.`}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile label="AIN No" value={details?.header.ainNumber} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
              <KpiTile label="Buyer" value={details?.header.buyerName} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
              <KpiTile label="Order No" value={details?.header.order} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
              <KpiTile label="Sub Contractor" value={details?.header.subContractorCode} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
              <KpiTile label="Process" value={details?.header.additionalProcessCode} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
              <KpiTile
                label="Date"
                value={details?.header?.transactionDate && format(parseISO(details.header.transactionDate), "dd-MMM-yyyy")}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 3, lg: 12 }}
              />
            </Grid>
            <AinPrintReportGrid data={details?.lines ?? []} isLoading={isLoading} isError={isError} />
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>
    </Box>
  );
}
