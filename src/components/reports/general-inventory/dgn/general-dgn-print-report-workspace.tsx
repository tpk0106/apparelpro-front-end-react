import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

import GeneralDgnPrintReportGrid from "./general-dgn-print-report-grid";
import KpiTile from "../../../common/kpi-tile";
import {
  useDownloadGeneralDgnPrintPdfMutation,
  useGetGeneralDgnPrintDetailsQuery,
} from "../../../../tanstack-hooks/general-inventory/general-dgn-print-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";

export default function GeneralDgnPrintReportWorkspace() {
  const [dgnNumberInput, setDgnNumberInput] = useState<string>("");
  const [searchedDgnNumber, setSearchedDgnNumber] = useState<string>("");

  const isReady = searchedDgnNumber.trim().length > 0;

  const {
    data: details,
    isLoading,
    isError,
    error,
  } = useGetGeneralDgnPrintDetailsQuery(searchedDgnNumber, isReady);
  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadGeneralDgnPrintPdfMutation();

  const handleLoad = () => {
    const trimmed = dgnNumberInput.trim();
    if (!trimmed) return;
    setSearchedDgnNumber(trimmed);
  };

  const handleDownloadPdf = async () => {
    if (!searchedDgnNumber) return;
    try {
      await downloadPdf(searchedDgnNumber);
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
            Damaged Goods Note (General Inventory) — Print
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
              label="DGN No"
              size="small"
              fullWidth
              value={dgnNumberInput}
              onChange={(e) => setDgnNumberInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLoad();
              }}
              placeholder="e.g. 000001"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleLoad}
              disabled={!dgnNumberInput.trim()}
              fullWidth
            >
              Load
            </Button>
          </Grid>
        </Grid>

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Enter a DGN No and click Load to preview and print.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? `DGN No '${searchedDgnNumber}' not found.`}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile label="DGN No" value={details?.header.dgnNumber} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
              <KpiTile label="Stores" value={details?.header.storeDescription} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
              <KpiTile
                label="Date"
                value={details?.header?.transactionDate && format(parseISO(details.header.transactionDate), "dd-MMM-yyyy")}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 3, lg: 12 }}
              />
            </Grid>
            <GeneralDgnPrintReportGrid data={details?.lines ?? []} isLoading={isLoading} isError={isError} />
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>
    </Box>
  );
}
