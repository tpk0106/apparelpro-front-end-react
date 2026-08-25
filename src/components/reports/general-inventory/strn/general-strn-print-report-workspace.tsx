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

import GeneralStrnPrintReportGrid from "./general-strn-print-report-grid";
import KpiTile from "../../../common/kpi-tile";
import {
  useDownloadGeneralStrnPrintPdfMutation,
  useGetGeneralStrnPrintDetailsQuery,
} from "../../../../tanstack-hooks/general-inventory/general-strn-print-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";

export default function GeneralStrnPrintReportWorkspace() {
  const [srnNumberInput, setSrnNumberInput] = useState<string>("");
  const [searchedSrnNumber, setSearchedSrnNumber] = useState<string>("");

  const isReady = searchedSrnNumber.trim().length > 0;

  const {
    data: details,
    isLoading,
    isError,
    error,
  } = useGetGeneralStrnPrintDetailsQuery(searchedSrnNumber, isReady);
  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadGeneralStrnPrintPdfMutation();

  const handleLoad = () => {
    const trimmed = srnNumberInput.trim();
    if (!trimmed) return;
    setSearchedSrnNumber(trimmed);
  };

  const handleDownloadPdf = async () => {
    if (!searchedSrnNumber) return;
    try {
      await downloadPdf(searchedSrnNumber);
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
            Stores Requisition Note (General Inventory) — Print
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
              label="SRN No"
              size="small"
              fullWidth
              value={srnNumberInput}
              onChange={(e) => setSrnNumberInput(e.target.value)}
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
              disabled={!srnNumberInput.trim()}
              fullWidth
            >
              Load
            </Button>
          </Grid>
        </Grid>

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Enter an SRN No and click Load to preview and print.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? `SRN No '${searchedSrnNumber}' not found.`}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile label="SRN No" value={details?.header.srnNumber} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
              <KpiTile label="From Stores" value={details?.header.storeDescription} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
              <KpiTile label="To Department" value={details?.header.departmentCode} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
              <KpiTile
                label="Date"
                value={details?.header?.transactionDate && format(parseISO(details.header.transactionDate), "dd-MMM-yyyy")}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 3, lg: 12 }}
              />
            </Grid>
            <GeneralStrnPrintReportGrid data={details?.lines ?? []} isLoading={isLoading} isError={isError} />
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>
    </Box>
  );
}
