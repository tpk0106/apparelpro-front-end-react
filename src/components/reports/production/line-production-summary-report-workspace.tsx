import { useState } from "react";
import {
  Alert, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, ThemeProvider, Typography,
} from "@mui/material";
import {
  useGetLineProductionSummaryReport,
  useDownloadLineProductionSummaryReportPdfMutation,
} from "../../../tanstack-hooks/line-production-summary-report.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import { withReadableReportTable } from "../../../themes/report-table-theme";
import { DateRangeFilterCard } from "./production-summary-style-wise-report-shared";

const LineProductionSummaryReportWorkspace = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { data: report, isLoading, isError, error } =
    useGetLineProductionSummaryReport(startDate || null, endDate || null);
  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadLineProductionSummaryReportPdfMutation();

  return (
    <div className="flex flex-col w-[95%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Line Production Summary</Typography>
        </ThemeProvider>
      </div>

      <DateRangeFilterCard
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onDownloadPdf={() => downloadPdf({ startDate, endDate })}
        downloadDisabled={!report || isDownloading || !startDate || !endDate}
        isDownloading={isDownloading}
        captionText={report ? `Final section: ${report.finalSectionDescription} · Cumulative is all-time up to End Date` : undefined}
      />

      {isLoading && <Typography>Loading...</Typography>}
      {isError && <Alert severity="info">{error.message}</Alert>}

      {report && (
        <ThemeProvider theme={withReadableReportTable}>
          <TableContainer component={Card} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Line</TableCell>
                  <TableCell align="right">This Period Qty</TableCell>
                  <TableCell align="right">Cumulative Qty</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.rows.map((row) => (
                  <TableRow key={row.lineCode}>
                    <TableCell>{row.lineDescription}</TableCell>
                    <TableCell align="right">{row.periodQty.toLocaleString()}</TableCell>
                    <TableCell align="right">{row.cumulativeQty.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>TOTAL</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>{report.totalPeriodQty.toLocaleString()}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>{report.totalCumulativeQty.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </ThemeProvider>
      )}

      {!isLoading && !isError && !report && (
        <Typography color="text.secondary">Pick a date range to see the line production summary.</Typography>
      )}
    </div>
  );
};

export default LineProductionSummaryReportWorkspace;
