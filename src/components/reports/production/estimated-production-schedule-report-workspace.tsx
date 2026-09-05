import { useState } from "react";
import {
  Alert, Box, Button, Card, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, ThemeProvider, Typography,
} from "@mui/material";
import {
  useGetEstimatedProductionScheduleReport,
  useDownloadEstimatedProductionScheduleReportPdfMutation,
} from "../../../tanstack-hooks/estimated-production-schedule-report.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import { withReadableReportTable } from "../../../themes/report-table-theme";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../../themes/useDropdownTheme";
import {
  workspaceHeadingSx,
  primaryActionButtonSx,
  themedButtonLabelStyle,
  dateIconFieldSx,
} from "../../../themes/workspace-theme";

const today = () => new Date().toISOString().slice(0, 10);
const inOneMonth = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
};

const EstimatedProductionScheduleReportWorkspace = () => {
  const { fieldSx: dropdownFieldSx } = useDropdownTheme();
  const [fromDate, setFromDate] = useState(today());
  const [toDate, setToDate] = useState(inOneMonth());
  const { data: report, isLoading, isError, error } = useGetEstimatedProductionScheduleReport(fromDate, toDate);
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadEstimatedProductionScheduleReportPdfMutation();

  return (
    <div className="flex flex-col w-[90%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography sx={workspaceHeadingSx}>Estimated Production Schedule</Typography>
        </ThemeProvider>
      </div>

      <Card variant="outlined" sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", gap: 2, backgroundColor: DASHBOARD_COLORS.cardBg, borderColor: DASHBOARD_COLORS.border }}>
        <TextField
          label="From Date" type="date" size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          value={fromDate} onChange={(e) => setFromDate(e.target.value)}
          sx={{ ...dropdownFieldSx, ...(dateIconFieldSx as Record<string, unknown>) }}
        />
        <TextField
          label="To Date" type="date" size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          value={toDate} onChange={(e) => setToDate(e.target.value)}
          sx={{ ...dropdownFieldSx, ...(dateIconFieldSx as Record<string, unknown>) }}
        />
        <Button
          variant="contained"
          disabled={!report || isDownloading}
          onClick={() => downloadPdf({ fromDate, toDate })}
          sx={primaryActionButtonSx}
        >
          <span style={themedButtonLabelStyle}>{isDownloading ? "Preparing PDF..." : "Print / Download PDF"}</span>
        </Button>
      </Card>

      {isLoading && <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>Loading...</Typography>}
      {isError && <Alert severity="info">{error.message}</Alert>}

      {report && (
        <ThemeProvider theme={withReadableReportTable}>
          <TableContainer component={Card} variant="outlined" sx={{ backgroundColor: DASHBOARD_COLORS.cardBg, borderColor: DASHBOARD_COLORS.border }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Line</TableCell>
                  <TableCell>Est. Start</TableCell>
                  <TableCell>Est. End</TableCell>
                  <TableCell>Buyer</TableCell>
                  <TableCell>Style</TableCell>
                  <TableCell align="right">Est. Prod/Day</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell align="right">Lead Time</TableCell>
                  <TableCell align="right">No. Days</TableCell>
                  <TableCell align="right">Total Qty</TableCell>
                  <TableCell>Ship Date</TableCell>
                  <TableCell align="right">Float</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.rows.map((row, index) => (
                  <TableRow key={`${row.lineCode}-${row.buyerCode}-${row.styleCode}-${index}`}>
                    <TableCell>{row.lineCode}</TableCell>
                    <TableCell>{row.estStartDate}</TableCell>
                    <TableCell>{row.estEndDate}</TableCell>
                    <TableCell>{row.buyerName}</TableCell>
                    <TableCell>{row.styleCode}</TableCell>
                    <TableCell align="right">{row.estimatedProductionPerDay.toLocaleString()}</TableCell>
                    <TableCell>{row.unit}</TableCell>
                    <TableCell align="right">{row.leadTimeDays}</TableCell>
                    <TableCell align="right">{row.numberOfDays}</TableCell>
                    <TableCell align="right">{row.totalQuantity.toLocaleString()}</TableCell>
                    <TableCell>{row.shipDate}</TableCell>
                    <TableCell align="right">
                      <Chip size="small" label={row.floatDays} color={row.floatDays < 0 ? "error" : "success"} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ThemeProvider>
      )}

      {!isLoading && !isError && !report && (
        <Box>
          <Typography color="text.secondary">Pick a date range to see the estimated production schedule.</Typography>
        </Box>
      )}
    </div>
  );
};

export default EstimatedProductionScheduleReportWorkspace;
