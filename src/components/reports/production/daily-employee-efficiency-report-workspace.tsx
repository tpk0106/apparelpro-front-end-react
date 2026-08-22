import { useMemo, useState } from "react";
import {
  Alert, Autocomplete, Box, Button, Card, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, ThemeProvider, Typography,
} from "@mui/material";
import type { ProductionLine } from "../../../interfaces/production/ProductionLine";
import { useGetProductionLines } from "../../../tanstack-hooks/production-reference.hooks";
import {
  useGetDailyEmployeeEfficiencyReport,
  useDownloadDailyEmployeeEfficiencyReportPdfMutation,
} from "../../../tanstack-hooks/daily-employee-efficiency-report.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import { withReadableReportTable } from "../../../themes/report-table-theme";

const dateFieldSx = {
  "& .MuiOutlinedInput-input": { color: "#F4F6F8" },
  "& input::-webkit-calendar-picker-indicator": { filter: "invert(1)" },
};

const selectFieldSx = {
  "& .MuiOutlinedInput-input": { color: "#F4F6F8" },
};

const DailyEmployeeEfficiencyReportWorkspace = () => {
  const [date, setDate] = useState("");
  const [selectedLine, setSelectedLine] = useState<ProductionLine | null>(null);

  const { data: linePageData } = useGetProductionLines({
    pageIndex: 0, pageSize: 999, sortColumn: "lineCode", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const linesList = useMemo<ProductionLine[]>(() => linePageData?.items || [], [linePageData]);

  const lineCode = selectedLine?.lineCode ?? null;
  const { data: report, isLoading, isError, error } = useGetDailyEmployeeEfficiencyReport(date || null, lineCode);
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadDailyEmployeeEfficiencyReportPdfMutation();

  return (
    <div className="flex flex-col w-[95%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Daily Employee Efficiency</Typography>
        </ThemeProvider>
      </div>

      <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Date" type="date" size="small" fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={date} onChange={(e) => setDate(e.target.value)}
              sx={dateFieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              options={linesList}
              getOptionLabel={(option) => `${option.lineCode} - ${option.description}`}
              value={selectedLine}
              onChange={(_, val) => setSelectedLine(val)}
              isOptionEqualToValue={(option, value) => option.lineCode === value?.lineCode}
              renderInput={(params) => <TextField {...params} label="Line (optional)" size="small" sx={selectFieldSx} />}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            disabled={!report || isDownloading || !date}
            onClick={() => downloadPdf({ date, lineCode })}
          >
            {isDownloading ? "Preparing PDF..." : "Print / Download PDF"}
          </Button>
          {report?.lineDescription && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Line: {report.lineCode} — {report.lineDescription}
            </Typography>
          )}
        </Box>
      </Card>

      {isLoading && <Typography>Loading...</Typography>}
      {isError && <Alert severity="info">{error.message}</Alert>}

      {report && (
        <ThemeProvider theme={withReadableReportTable}>
          <TableContainer component={Card} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Emp. #</TableCell>
                  <TableCell>Employee Name</TableCell>
                  <TableCell align="right">Hrs. Worked</TableCell>
                  <TableCell align="right">Hrs. Earned</TableCell>
                  <TableCell align="right">NP Hrs.</TableCell>
                  <TableCell align="right">Overall Eff.</TableCell>
                  <TableCell align="right">Operator Eff.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.rows.map((row) => (
                  <TableRow key={row.employeeCode}>
                    <TableCell>{row.employeeCode}</TableCell>
                    <TableCell>{row.employeeName}</TableCell>
                    <TableCell align="right">{row.workHours.toFixed(2)}</TableCell>
                    <TableCell align="right">{row.earnedHours.toFixed(2)}</TableCell>
                    <TableCell align="right">{row.nonProductiveHours.toFixed(2)}</TableCell>
                    <TableCell align="right">{row.overEfficiencyPercent.toFixed(2)} %</TableCell>
                    <TableCell align="right">{row.operatorEfficiencyPercent.toFixed(2)} %</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ThemeProvider>
      )}

      {!isLoading && !isError && !report && (
        <Typography color="text.secondary">Pick a date to see the daily employee efficiency.</Typography>
      )}
    </div>
  );
};

export default DailyEmployeeEfficiencyReportWorkspace;
