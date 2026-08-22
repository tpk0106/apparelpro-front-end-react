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
  useGetProductionSummaryMonthlyReport,
  useDownloadProductionSummaryMonthlyReportPdfMutation,
} from "../../../tanstack-hooks/production-summary-monthly-report.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import { withReadableReportTable } from "../../../themes/report-table-theme";

const currentMonth = () => new Date().toISOString().slice(0, 7);

const dateFieldSx = {
  "& .MuiOutlinedInput-input": { color: "#F4F6F8" },
  "& input::-webkit-calendar-picker-indicator": { filter: "invert(1)" },
};

const pct = (est: number | null, act: number | null) =>
  est && act && est > 0 ? `${((act / est) * 100).toFixed(1)}%` : "-";

const ProductionSummaryMonthlyReportWorkspace = () => {
  const [monthValue, setMonthValue] = useState(currentMonth());
  const [year, month] = monthValue ? monthValue.split("-").map(Number) : [null, null];
  const { data: report, isLoading, isError, error } = useGetProductionSummaryMonthlyReport(year, month);
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadProductionSummaryMonthlyReportPdfMutation();

  return (
    <div className="flex flex-col w-[95%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Production Summary (Monthly)</Typography>
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
            Final section: {report.finalSectionDescription}
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
                <TableCell rowSpan={1}>Day</TableCell>
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

                return day.subRows.map((subRow, subRowIndex) => (
                  <TableRow key={`${day.date}-${subRowIndex}`}>
                    <TableCell>{subRowIndex === 0 ? new Date(day.date).getDate() : ""}</TableCell>
                    {subRow.lineCells.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} align="right">
                        <Box sx={{ fontSize: "0.75rem" }}>{cell.styleCode ?? "-"}</Box>
                        <Box sx={{ fontSize: "0.75rem" }}>
                          {cell.estQuantity ?? "-"} / {cell.actQuantity ?? "-"} ({pct(cell.estQuantity, cell.actQuantity)})
                        </Box>
                        <Box sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                          Cum: {cell.cumEstQuantity.toLocaleString()} / {cell.cumActQuantity.toLocaleString()}{" "}
                          ({pct(cell.cumEstQuantity, cell.cumActQuantity)})
                        </Box>
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <Box sx={{ fontSize: "0.75rem" }}>
                        {subRow.totalEstQuantity.toLocaleString()} / {subRow.totalActQuantity.toLocaleString()}{" "}
                        ({pct(subRow.totalEstQuantity, subRow.totalActQuantity)})
                      </Box>
                      <Box sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                        Cum: {subRow.totalCumEstQuantity.toLocaleString()} / {subRow.totalCumActQuantity.toLocaleString()}{" "}
                        ({pct(subRow.totalCumEstQuantity, subRow.totalCumActQuantity)})
                      </Box>
                    </TableCell>
                  </TableRow>
                ));
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

export default ProductionSummaryMonthlyReportWorkspace;
