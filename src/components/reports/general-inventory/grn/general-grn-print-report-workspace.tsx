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

import GeneralGrnPrintReportGrid from "./general-grn-print-report-grid";
import KpiTile from "../../../common/kpi-tile";
import {
  useDownloadGeneralGrnPrintPdfMutation,
  useGetGeneralGrnPrintDetailsQuery,
} from "../../../../tanstack-hooks/general-inventory/general-grn-print-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";

export default function GeneralGrnPrintReportWorkspace() {
  const [grnNumberInput, setGrnNumberInput] = useState<string>("");
  const [searchedGrnNumber, setSearchedGrnNumber] = useState<string>("");

  const isReady = searchedGrnNumber.trim().length > 0;

  const {
    data: details,
    isLoading,
    isError,
    error,
  } = useGetGeneralGrnPrintDetailsQuery(searchedGrnNumber, isReady);
  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadGeneralGrnPrintPdfMutation();

  const handleLoad = () => {
    const trimmed = grnNumberInput.trim();
    if (!trimmed) return;
    setSearchedGrnNumber(trimmed);
  };

  const handleDownloadPdf = async () => {
    if (!searchedGrnNumber) return;
    try {
      await downloadPdf(searchedGrnNumber);
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
            Goods Received Note (General Inventory) — Print
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
              label="GRN No"
              size="small"
              fullWidth
              value={grnNumberInput}
              onChange={(e) => setGrnNumberInput(e.target.value)}
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
              disabled={!grnNumberInput.trim()}
              fullWidth
            >
              Load
            </Button>
          </Grid>
        </Grid>

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Enter a GRN No and click Load to preview and print.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? `GRN No '${searchedGrnNumber}' not found.`}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile label="GRN No" value={details?.header.grnNumber} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
              <KpiTile label="P/O No" value={details?.header.poNumber} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
              <KpiTile label="Supplier" value={details?.header.supplierCode} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
              <KpiTile label="Currency" value={details?.header.currencyCode} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
              <KpiTile
                label="Date"
                value={details?.header?.transactionDate && format(parseISO(details.header.transactionDate), "dd-MMM-yyyy")}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 3, lg: 12 }}
              />
            </Grid>
            <GeneralGrnPrintReportGrid data={details?.lines ?? []} isLoading={isLoading} isError={isError} />
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>
    </Box>
  );
}
