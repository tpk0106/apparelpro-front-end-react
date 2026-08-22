import { useState } from "react";
import {
  Alert, Box, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, ThemeProvider, Typography, Button,
} from "@mui/material";
import {
  useGetMonthlyEmployeeEfficiencyReport,
  useDownloadMonthlyEmployeeEfficiencyReportPdfMutation,
} from "../../../tanstack-hooks/monthly-employee-efficiency-report.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import { withReadableReportTable } from "../../../themes/report-table-theme";

const currentMonth = () => new Date().toISOString().slice(0, 7);

const dateFieldSx = {
  "& .MuiOutlinedInput-input": { color: "#F4F6F8" },
  "& input::-webkit-calendar-picker-indicator": { filter: "invert(1)" },
};

const MonthlyEmployeeEfficiencyReportWorkspace = () => {
  const [monthValue, setMonthValue] = useState(currentMonth());
  const [year, month] = monthValue ? monthValue.split("-").map(Number) : [null, null];
  const { data: report, isLoading, isError, error } = useGetMonthlyEmployeeEfficiencyReport(year, month);
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadMonthlyEmployeeEfficiencyReportPdfMutation();

  return (
    <div className="flex flex-col w-[95%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Employee Efficiency (Monthly)</Typography>
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
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Work Hours/Day: {report.workHoursPerDay} (factory-wide, same for every employee/day)
          </Typography>
        )}
      </Card>

      {isLoading && <Typography>Loading...</Typography>}
      {isError && <Alert severity="info">{error.message}</Alert>}

      {report && (
        <ThemeProvider theme={withReadableReportTable}>
          <TableContainer component={Card} variant="outlined" sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Emp #</TableCell>
                  <TableCell>Employee Name</TableCell>
                  {Array.from({ length: report.daysInMonth }, (_, i) => i + 1).map((day) => (
                    <TableCell key={day} align="center">{day}</TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>Monthly Avg</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.rows.map((row) => (
                  <TableRow key={row.employeeCode}>
                    <TableCell>{row.employeeCode}</TableCell>
                    <TableCell>{row.employeeName}</TableCell>
                    {row.days.map((cell) => (
                      <TableCell key={cell.day} align="center">
                        {cell.operatorEfficiencyPercent === null ? "" : cell.operatorEfficiencyPercent.toFixed(1)}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      {row.monthlyAverageEfficiencyPercent.toFixed(1)}
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
          <Typography color="text.secondary">Pick a month to see the employee efficiency.</Typography>
        </Box>
      )}
    </div>
  );
};

export default MonthlyEmployeeEfficiencyReportWorkspace;
