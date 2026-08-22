import { useMemo, useState } from "react";
import {
  Alert, Autocomplete, Box, Button, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, ThemeProvider, Typography,
} from "@mui/material";
import type { ProductionLine } from "../../../interfaces/production/ProductionLine";
import { useGetProductionLines } from "../../../tanstack-hooks/production-reference.hooks";
import {
  useGetLineEfficiencyReport,
  useDownloadLineEfficiencyReportPdfMutation,
} from "../../../tanstack-hooks/line-efficiency-report.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import { withReadableReportTable } from "../../../themes/report-table-theme";
import LineEfficiencyBarChart from "./line-efficiency-bar-chart.component";

const currentMonth = () => new Date().toISOString().slice(0, 7);

const dateFieldSx = {
  "& .MuiOutlinedInput-input": { color: "#F4F6F8" },
  "& input::-webkit-calendar-picker-indicator": { filter: "invert(1)" },
};

const selectFieldSx = {
  "& .MuiOutlinedInput-input": { color: "#F4F6F8" },
};

const LineEfficiencyReportWorkspace = () => {
  const [selectedLine, setSelectedLine] = useState<ProductionLine | null>(null);
  const [monthValue, setMonthValue] = useState(currentMonth());
  const [year, month] = monthValue ? monthValue.split("-").map(Number) : [null, null];

  const { data: linePageData } = useGetProductionLines({
    pageIndex: 0, pageSize: 999, sortColumn: "lineCode", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const linesList = useMemo<ProductionLine[]>(() => linePageData?.items || [], [linePageData]);

  const scope = selectedLine && year && month
    ? { lineCode: selectedLine.lineCode, year, month }
    : null;

  const { data: report, isLoading, isError, error } = useGetLineEfficiencyReport(scope);
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadLineEfficiencyReportPdfMutation();

  return (
    <div className="flex flex-col w-[95%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Production Line Efficiency</Typography>
        </ThemeProvider>
      </div>

      <Card variant="outlined" sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Autocomplete
          options={linesList}
          sx={{ minWidth: 220 }}
          getOptionLabel={(option) => `${option.lineCode} - ${option.description}`}
          value={selectedLine}
          onChange={(_, val) => setSelectedLine(val)}
          isOptionEqualToValue={(option, value) => option.lineCode === value?.lineCode}
          renderInput={(params) => <TextField {...params} label="Line" size="small" sx={selectFieldSx} />}
        />
        <TextField
          label="Month" type="month" size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          value={monthValue} onChange={(e) => setMonthValue(e.target.value)}
          sx={dateFieldSx}
        />
        <Button
          variant="contained"
          disabled={!report || isDownloading || !scope}
          onClick={() => downloadPdf(scope!)}
        >
          {isDownloading ? "Preparing PDF..." : "Print / Download PDF"}
        </Button>
        {report && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Final section: {report.finalSectionDescription} · Work Hours/Day: {report.workHoursPerDay}
          </Typography>
        )}
      </Card>

      {isLoading && <Typography>Loading...</Typography>}
      {isError && <Alert severity="info">{error.message}</Alert>}

      {report && (
        <>
          <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: "#F4F6F8" }}>
              {report.lineCode} — {report.lineDescription}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5, height: 260, borderLeft: "1px solid", borderBottom: "1px solid", borderColor: "divider", p: 1, overflowX: "auto" }}>
              {report.days.map((cell) => (
                <Box key={cell.day} sx={{ minWidth: 22, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                  {cell.efficiencyPercent !== null && (
                    <Typography variant="caption" sx={{ fontSize: "0.6rem", color: "#F4F6F8" }}>{cell.efficiencyPercent}%</Typography>
                  )}
                  <Box
                    sx={{
                      width: "100%",
                      height: `${Math.min(cell.efficiencyPercent ?? 0, 100)}%`,
                      bgcolor: cell.isHoliday ? "grey.500" : "primary.main",
                      borderRadius: "2px 2px 0 0",
                      minHeight: cell.efficiencyPercent ? 2 : 0,
                    }}
                  />
                  <Typography variant="caption" sx={{ mt: 0.5, fontSize: "0.6rem", color: "#F4F6F8" }}>{cell.day}</Typography>
                </Box>
              ))}
            </Box>
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold", color: "#F4F6F8" }}>
              Total Line Efficiency for Month: {report.monthlyAverageEfficiencyPercent.toFixed(2)}%
            </Typography>
          </Card>

          <ThemeProvider theme={withReadableReportTable}>
            <TableContainer component={Card} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Day</TableCell>
                    <TableCell>Day of Week</TableCell>
                    <TableCell align="right">Efficiency %</TableCell>
                    <TableCell>Note</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.days.map((cell) => (
                    <TableRow key={cell.day}>
                      <TableCell>{cell.day}</TableCell>
                      <TableCell>{cell.dayOfWeek}</TableCell>
                      <TableCell align="right">{cell.efficiencyPercent === null ? "-" : `${cell.efficiencyPercent}%`}</TableCell>
                      <TableCell>{cell.isHoliday ? cell.holidayDescription ?? "Holiday" : ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </ThemeProvider>

          <Card variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: "#F4F6F8" }}>
              Efficiency Trend — {report.lineCode} — {report.lineDescription}
            </Typography>
            <LineEfficiencyBarChart days={report.days} monthlyAverage={report.monthlyAverageEfficiencyPercent} />
          </Card>
        </>
      )}

      {!isLoading && !isError && !report && (
        <Typography color="text.secondary">Select a Line and Month to see the line efficiency.</Typography>
      )}
    </div>
  );
};

export default LineEfficiencyReportWorkspace;
