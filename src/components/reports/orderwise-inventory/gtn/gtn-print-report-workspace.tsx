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

import GtnPrintReportGrid from "./gtn-print-report-grid";
import KpiTile from "../../../common/kpi-tile";

import { format, parseISO } from "date-fns";
import {
  useDownloadGtnPrintPdfMutation,
  useGetGtnPrintDetailsQuery,
} from "../../../../tanstack-hooks/gtn-print-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../../../themes/useDropdownTheme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
} from "../../../../themes/workspace-theme";

export default function GtnPrintReportWorkspace() {
  const { fieldSx: dropdownFieldSx } = useDropdownTheme();
  const [gtnNumberInput, setGtnNumberInput] = useState<string>("");
  const [searchedGtnNumber, setSearchedGtnNumber] = useState<string>("");

  const isReady = searchedGtnNumber.trim().length > 0;

  const {
    data: details,
    isLoading,
    isError,
    error,
  } = useGetGtnPrintDetailsQuery(searchedGtnNumber, isReady);

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadGtnPrintPdfMutation();

  const handleLoad = () => {
    const trimmed = gtnNumberInput.trim();
    if (!trimmed) return;
    setSearchedGtnNumber(trimmed);
  };

  const handleDownloadPdf = async () => {
    if (!searchedGtnNumber) return;
    try {
      await downloadPdf(searchedGtnNumber);
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
            Goods Transfer Note — Print (ORDERWISE)
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3, alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="GTN No"
              size="small"
              fullWidth
              value={gtnNumberInput}
              onChange={(e) => setGtnNumberInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLoad();
              }}
              placeholder="e.g. 000123"
              sx={dropdownFieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleLoad}
              disabled={!gtnNumberInput.trim()}
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
            sx={primaryActionButtonSx}
          >
            <span style={themedButtonLabelStyle}>
              {isDownloading ? "Generating..." : "Download PDF"}
            </span>
          </Button>
        </Box>

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Enter a GTN No and click Load to preview and print a committed
            Goods Transfer Note.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? `GTN No '${searchedGtnNumber}' not found.`}
          </Alert>
        ) : (
          <>
            <Grid
              container
              spacing={2}
              sx={{ mb: 2.5, flexDirection: "row" }}
              wrap="nowrap"
            >
              <KpiTile
                label="GTN No"
                value={details?.header.gtnNumber}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 3, lg: 8 }}
              />

              <KpiTile
                label="From Buyer"
                value={details?.header.fromBuyerName}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 3, lg: 16 }}
              />

              <KpiTile
                label="From Order"
                value={details?.header.fromOrder}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
              />

              <KpiTile
                label="To Buyer"
                value={details?.header.toBuyerName}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 3, lg: 16 }}
              />

              <KpiTile
                label="To Order"
                value={details?.header.toOrder}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
              />

              <KpiTile
                label="Date"
                value={
                  details?.header?.transactionDate &&
                  format(
                    parseISO(details?.header?.transactionDate),
                    "dd-MMM-yyyy",
                  )
                }
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 3, lg: 8 }}
              />
            </Grid>
            <GtnPrintReportGrid
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
