import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import {
  useGetProductionSummaryMonthlyOverviewReport,
  useDownloadProductionSummaryMonthlyOverviewReportPdfMutation,
} from "../../../tanstack-hooks/production-summary-monthly-report.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import { withReadableReportTable } from "../../../themes/report-table-theme";

const currentMonth = () => new Date().toISOString().slice(0, 7);

const dateFieldSx = {
  "& .MuiOutlinedInput-input": { color: "#F4F6F8" },
  "& input::-webkit-calendar-picker-indicator": { filter: "invert(1)" },
};

const pct = (est: number, act: number) => (est > 0 && act > 0 ? `${((act / est) * 100).toFixed(1)}%` : "-");

const ProductionSummaryMonthlyOverviewReportWorkspace = () => {
  const [monthValue, setMonthValue] = useState(currentMonth());
  const [year, month] = monthValue ? monthValue.split("-").map(Number) : [null, null];
  const { data: report, isLoading, isError, error } = useGetProductionSummaryMonthlyOverviewReport(year, month);
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadProductionSummaryMonthlyOverviewReportPdfMutation();

  return (
    <div className="flex flex-col w-[95%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Production Summary (Monthly) - Simplified</Typography>
        </ThemeProvider>
      </div>

      <Card variant="outlined" sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          label="Month" type="month" size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          value={monthValue} onChange={(e) => setMonthValue(e.target.value)}
          sx={dateFieldSx}
        />
        <Button
          variant="contained"
          disabled={!report || isDownloading || year === null || month === null}
          onClick={() => downloadPdf({ year: year!, month: month! })}
        >
          {isDownloading ? "Preparing PDF..." : "Print / Download PDF"}
        </Button>
        {report && (
          <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.secondary" }}>
            Final section: {report.finalSectionDescription} &middot; multiple styles per line/day are summed into one cell
          </Typography>
        )}
      </Card>

      {isLoading && <Typography>Loading...</Typography>}
      {isError && <Alert severity="info">{error.message}</Alert>}

      {report && (
        <ThemeProvider theme={withReadableReportTable}>
        <TableContainer component={Card} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Day</TableCell>
                {report.lineDescriptions.map((desc) => (
                  <TableCell key={desc} align="center">{desc}</TableCell>
                ))}
                <TableCell align="center">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.days.map((day) => {
                if (day.isHoliday) {
                  return (
                    <TableRow key={day.date}>
                      <TableCell>{new Date(day.date).getDate()}</TableCell>
                      <TableCell colSpan={report.lineCodes.length + 1} align="center">
                        <i>{day.holidayDescription}</i>
                      </TableCell>
                    </TableRow>
                  );
                }

                return (
                  <TableRow key={day.date}>
                    <TableCell>{new Date(day.date).getDate()}</TableCell>
                    {day.lineCells.map((cell, index) => (
                      <TableCell key={index} align="right">
                        <Box sx={{ fontSize: "0.75rem" }}>
                          {cell.estQuantity.toLocaleString()} / {cell.actQuantity.toLocaleString()}{" "}
                          ({pct(cell.estQuantity, cell.actQuantity)})
                        </Box>
                        <Box sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                          Cum: {cell.cumEstQuantity.toLocaleString()} / {cell.cumActQuantity.toLocaleString()}{" "}
                          ({pct(cell.cumEstQuantity, cell.cumActQuantity)})
                        </Box>
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <Box sx={{ fontSize: "0.75rem" }}>
                        {day.totalEstQuantity.toLocaleString()} / {day.totalActQuantity.toLocaleString()}{" "}
                        ({pct(day.totalEstQuantity, day.totalActQuantity)})
                      </Box>
                      <Box sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                        Cum: {day.totalCumEstQuantity.toLocaleString()} / {day.totalCumActQuantity.toLocaleString()}{" "}
                        ({pct(day.totalCumEstQuantity, day.totalCumActQuantity)})
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        </ThemeProvider>
      )}

      {!isLoading && !isError && !report && (
        <Box>
          <Typography color="text.secondary">Pick a month to see the production summary.</Typography>
        </Box>
      )}
    </div>
  );
};

export default ProductionSummaryMonthlyOverviewReportWorkspace;
