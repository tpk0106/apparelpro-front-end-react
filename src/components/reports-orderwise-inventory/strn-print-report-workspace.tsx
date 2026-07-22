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

import StrnPrintReportGrid from "./strn-print-report-grid";
import {
  useGetStrnPrintDetailsQuery,
  useDownloadStrnPrintPdfMutation,
} from "../../tanstack-hooks/strn-print-report.hooks";
import type { AppError } from "../../auth/axiosClient";

export default function StrnPrintReportWorkspace() {
  const [strnNumberInput, setStrnNumberInput] = useState<string>("");
  const [searchedStrnNumber, setSearchedStrnNumber] = useState<string>("");

  const isReady = searchedStrnNumber.trim().length > 0;

  const {
    data: details,
    isLoading,
    isError,
    error,
  } = useGetStrnPrintDetailsQuery(searchedStrnNumber, isReady);

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadStrnPrintPdfMutation();

  const handleLoad = () => {
    const trimmed = strnNumberInput.trim();
    if (!trimmed) return;
    setSearchedStrnNumber(trimmed);
  };

  const handleDownloadPdf = async () => {
    if (!searchedStrnNumber) return;
    try {
      await downloadPdf(searchedStrnNumber);
    } catch (err) {
      const appError = err as AppError;
      toast.error(appError?.message ?? "Failed to generate the PDF.");
    }
  };

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderTop: "4px solid #60a5fa",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Stores Requisition Note — Print Report
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Legacy reference: in_strn2.prg
            </Typography>
          </Box>
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
              value={strnNumberInput}
              onChange={(e) => setStrnNumberInput(e.target.value)}
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
              disabled={!strnNumberInput.trim()}
              fullWidth
            >
              Load
            </Button>
          </Grid>
        </Grid>

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Enter an SRN No and click Load to preview and print a committed
            Stores Requisition Note.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? `SRN No '${searchedStrnNumber}' not found.`}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <InfoTile
                label="SRN No"
                value={details?.header.strnNumber}
                loading={isLoading}
              />
              <InfoTile
                label="Buyer"
                value={details?.header.buyerCode}
                loading={isLoading}
              />
              <InfoTile
                label="Order No"
                value={details?.header.order}
                loading={isLoading}
              />
              <InfoTile
                label="To Department"
                value={details?.header.departmentCode}
                loading={isLoading}
              />
            </Grid>

            <StrnPrintReportGrid
              data={details?.lines ?? []}
              isLoading={isLoading}
              isError={isError}
            />

            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">
              Buyer and Department are shown as their stored codes; a name
              lookup can be added later if needed. The printed date/time
              always reflects the moment this PDF is generated, matching the
              legacy in_strn2.prg behaviour of reprinting with today's date
              rather than the original transaction date.
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
}

function InfoTile({
  label,
  value,
  loading,
}: {
  label: string;
  value: string | number | undefined;
  loading: boolean;
}) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: "uppercase" }}
        >
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#F4F6F8" }}>
          {loading ? "…" : (value ?? "—")}
        </Typography>
      </Paper>
    </Grid>
  );
}
