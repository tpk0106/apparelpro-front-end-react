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
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../../themes/useDropdownTheme";
import {
  workspaceHeadingSx,
  primaryActionButtonSx,
  themedButtonLabelStyle,
  dateIconFieldSx,
} from "../../../themes/workspace-theme";

const DailyEmployeeEfficiencyReportWorkspace = () => {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
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
          <Typography sx={workspaceHeadingSx}>Daily Employee Efficiency</Typography>
        </ThemeProvider>
      </div>

      <Card variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: DASHBOARD_COLORS.cardBg, borderColor: DASHBOARD_COLORS.border }}>
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Date" type="date" size="small" fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={date} onChange={(e) => setDate(e.target.value)}
              sx={dateIconFieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              options={linesList}
              getOptionLabel={(option) => `${option.lineCode} - ${option.description}`}
              value={selectedLine}
              onChange={(_, val) => setSelectedLine(val)}
              isOptionEqualToValue={(option, value) => option.lineCode === value?.lineCode}
              slotProps={{ listbox: { sx: dropdownListboxSx } }}
              renderInput={(params) => <TextField {...params} label="Line (optional)" size="small" sx={dropdownFieldSx} />}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            disabled={!report || isDownloading || !date}
            onClick={() => downloadPdf({ date, lineCode })}
            sx={primaryActionButtonSx}
          >
            <span style={themedButtonLabelStyle}>{isDownloading ? "Preparing PDF..." : "Print / Download PDF"}</span>
          </Button>
          {report?.lineDescription && (
            <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary }}>
              Line: {report.lineCode} — {report.lineDescription}
            </Typography>
          )}
        </Box>
      </Card>

      {isLoading && <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>Loading...</Typography>}
      {isError && <Alert severity="info">{error.message}</Alert>}

      {report && (
        <ThemeProvider theme={withReadableReportTable}>
          <TableContainer component={Card} variant="outlined" sx={{ backgroundColor: DASHBOARD_COLORS.cardBg, borderColor: DASHBOARD_COLORS.border }}>
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
