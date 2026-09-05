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

import RtnPrintReportGrid from "./rtn-print-report-grid";
import KpiTile from "../../../common/kpi-tile";

import { format, parseISO } from "date-fns";
import {
  useDownloadRtnPrintPdfMutation,
  useGetRtnPrintDetailsQuery,
} from "../../../../tanstack-hooks/rtn-print-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../../../themes/useDropdownTheme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
} from "../../../../themes/workspace-theme";

export default function RtnPrintReportWorkspace() {
  const { fieldSx: dropdownFieldSx } = useDropdownTheme();
  const [rtnNumberInput, setRtnNumberInput] = useState<string>("");
  const [searchedRtnNumber, setSearchedRtnNumber] = useState<string>("");

  const isReady = searchedRtnNumber.trim().length > 0;

  const {
    data: details,
    isLoading,
    isError,
    error,
  } = useGetRtnPrintDetailsQuery(searchedRtnNumber, isReady);

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadRtnPrintPdfMutation();

  const handleLoad = () => {
    const trimmed = rtnNumberInput.trim();
    if (!trimmed) return;
    setSearchedRtnNumber(trimmed);
  };

  const handleDownloadPdf = async () => {
    if (!searchedRtnNumber) return;
    try {
      await downloadPdf(searchedRtnNumber);
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
            Goods Return Note — Print (ORDERWISE)
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3, alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="RTN No"
              size="small"
              fullWidth
              value={rtnNumberInput}
              onChange={(e) => setRtnNumberInput(e.target.value)}
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
              disabled={!rtnNumberInput.trim()}
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
            Enter an RTN No and click Load to preview and print a committed
            Goods Return Note.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? `RTN No '${searchedRtnNumber}' not found.`}
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
                label="RTN No"
                value={details?.header.rtnNumber}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
              />

              <KpiTile
                label="Buyer"
                value={details?.header.buyerName}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 3, lg: 20 }}
              />

              <KpiTile
                label="Order No"
                value={details?.header.order}
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
                size={{ xs: 12, sm: 6, md: 3, lg: 10 }}
              />
            </Grid>
            <RtnPrintReportGrid
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
