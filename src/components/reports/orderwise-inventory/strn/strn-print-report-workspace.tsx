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

import { format, parseISO } from "date-fns";
import {
  useDownloadStrnPrintPdfMutation,
  useGetStrnPrintDetailsQuery,
} from "../../../../tanstack-hooks/strn-print-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";

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
              Stores Requisition Note — Print
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
            {/* <Grid
              container
              spacing={2}
              wrap="nowrap"
              sx={{
                mb: 2.5,
                width: "100%", // Extends the row to fill the entire horizontal space
                "& .MuiGrid-root": {
                  whiteSpace: "nowrap", // Forces all text inside the grid blocks to stay on one line
                  overflow: "hidden", // Cuts off text safely if it runs out of room
                  textOverflow: "ellipsis", // Adds '...' instead of breaking to a new line
                },
              }}
            >
            
              <Grid size={{ xs: "auto" }} sx={{ minWidth: "10%" }}>
                <InfoTile
                  label="SRN No"
                  value={details?.header.strnNumber}
                  loading={isLoading}
                />
              </Grid>

              <Grid size="grow">
                <InfoTile
                  label="Buyer"
                  value={details?.header.buyerName}
                  loading={isLoading}
                />
              </Grid>

              <Grid size="grow">
                <InfoTile
                  label="Order No"
                  value={details?.header.order}
                  loading={isLoading}
                />
              </Grid>

              <Grid size="grow">
                <InfoTile
                  label="To Department"
                  value={details?.header.departmentCode}
                  loading={isLoading}
                />
              </Grid>

              <Grid size="grow">
                <InfoTile
                  label="Date"
                  value={
                    details?.header?.transactionDate &&
                    format(
                      parseISO(details?.header?.transactionDate),
                      "dd-MMM-yyyy",
                    )
                  }
                  loading={isLoading}
                />
              </Grid>
            </Grid> */}

            <Grid
              container
              spacing={2}
              sx={{ mb: 2.5, flexDirection: "row" }}
              wrap="nowrap"
            >
              <InfoTile
                label="SRN No"
                value={details?.header.strnNumber}
                loading={isLoading}
              />

              {/* <Grid sx={{ width: "200%" }}> */}
              <InfoTile
                label="Buyer"
                value={details?.header.buyerName}
                loading={isLoading}
              />
              {/* </Grid> */}
              {/* <Grid sx={{ width: "100%" }}> */}
              <InfoTile
                label="Order No"
                value={details?.header.order}
                loading={isLoading}
              />
              {/* </Grid> */}
              {/* <Grid sx={{ width: "100%" }}> */}
              <InfoTile
                label="To Department"
                value={details?.header.departmentCode}
                loading={isLoading}
              />
              {/* </Grid> */}
              {/* <Grid sx={{ width: "100%" }}> */}
              <InfoTile
                label="Date"
                value={
                  details?.header?.transactionDate &&
                  format(
                    parseISO(details?.header?.transactionDate),
                    "dd-MMM-yyyy",
                  )
                }
                loading={isLoading}
              />
              {/* </Grid> */}
            </Grid>
            <StrnPrintReportGrid
              data={details?.lines ?? []}
              isLoading={isLoading}
              isError={isError}
            />
            <Divider sx={{ my: 2 }} />
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
    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 12 }}>
      <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
        {/* Explicit hex instead of color="text.secondary": the same theme-prop
            resolution silently fell back to text.primary's near-black (#000000)
            for the value line below before it was hardcoded, so this label is
            hardcoded too rather than trusting the prop against this dark
            (#141922) card background a second time. */}
        <Typography
          variant="caption"
          sx={{ textTransform: "uppercase", color: "#8B93A1" }}
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
