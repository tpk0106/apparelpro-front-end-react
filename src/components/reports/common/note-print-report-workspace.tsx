import { useState, type ReactNode } from "react";
import { Alert, Box, Button, Divider, Paper, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

import type { AppError } from "../../../auth/axiosClient";

interface NotePrintReportWorkspaceProps<TDetails> {
  // e.g. "Goods Issue Note (General Inventory) — Print"
  title: string;
  // e.g. "GIN No" - used for the input label and placeholder-adjacent copy.
  numberLabel: string;
  useDetailsQuery: (documentNumber: string, enabled: boolean) => UseQueryResult<TDetails, AppError>;
  useDownloadMutation: () => UseMutationResult<void, AppError, string>;
  getNotFoundMessage: (documentNumber: string) => string;
  // Renders the KPI tile row from the loaded details - each note has a different
  // header shape, so this stays a caller-supplied slot rather than a fixed list.
  renderKpiTiles: (details: TDetails | undefined, isLoading: boolean) => ReactNode;
  // Renders the line-item grid (typically <NotePrintReportGrid columns={...} .../>).
  renderGrid: (details: TDetails | undefined, isLoading: boolean, isError: boolean) => ReactNode;
}

// Every note print report screen (General Inventory and Orderwise Inventory alike)
// is the same shell: enter a document number, Load it, show KPI tiles + a line grid
// once found, or an info/error Alert otherwise, plus a Download PDF button. Only the
// title, number label, data hooks, KPI tiles and grid columns differ per note -
// previously each of those ~130-line workspace files duplicated this entire shell
// independently.
export default function NotePrintReportWorkspace<TDetails>({
  title,
  numberLabel,
  useDetailsQuery,
  useDownloadMutation,
  getNotFoundMessage,
  renderKpiTiles,
  renderGrid,
}: NotePrintReportWorkspaceProps<TDetails>) {
  const [numberInput, setNumberInput] = useState<string>("");
  const [searchedNumber, setSearchedNumber] = useState<string>("");

  const isReady = searchedNumber.trim().length > 0;

  const { data: details, isLoading, isError, error } = useDetailsQuery(searchedNumber, isReady);
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadMutation();

  const handleLoad = () => {
    const trimmed = numberInput.trim();
    if (!trimmed) return;
    setSearchedNumber(trimmed);
  };

  const handleDownloadPdf = async () => {
    if (!searchedNumber) return;
    try {
      await downloadPdf(searchedNumber);
    } catch (err) {
      const appError = err as AppError;
      toast.error(appError?.message ?? "Failed to generate the PDF.");
    }
  };

  return (
    <Box sx={{ width: "95%", mx: "auto", p: 1 }}>
      <Paper elevation={3} sx={{ p: 3, backgroundColor: "#f9f9f9" }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {title}
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3, alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label={numberLabel}
              size="small"
              fullWidth
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
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
              disabled={!numberInput.trim()}
              fullWidth
            >
              Load
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownloadPdf}
            disabled={!isReady || !details || isDownloading}
          >
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
        </Box>

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Enter a {numberLabel} and click Load to preview and print.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? getNotFoundMessage(searchedNumber)}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              {renderKpiTiles(details, isLoading)}
            </Grid>
            {renderGrid(details, isLoading, isError)}
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>
    </Box>
  );
}
