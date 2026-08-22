import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import StyleScopePicker, {
  type StyleScope,
} from "../style-scope/style-scope-picker.component";
import DailyProductionTimeTicketTable from "./daily-production-time-ticket-table.component";
import { useGetProductionLines } from "../../../tanstack-hooks/production-reference.hooks";
import { useGetDailyProductionTimeTicket } from "../../../tanstack-hooks/daily-production-time-ticket.hooks";
import type { DailyProductionTimeTicketEntry } from "../../../interfaces/production/DailyProductionTimeTicket";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";

const todayIso = () => new Date().toISOString().slice(0, 10);

const DailyProductionTimeTicketWorkspace = () => {
  const [date, setDate] = useState(todayIso());
  const [lineCode, setLineCode] = useState("");
  const [scope, setScope] = useState<StyleScope | null>(null);

  const { data: linePageData } = useGetProductionLines({
    pageIndex: 0, pageSize: 999, sortColumn: "lineCode", sortOrder: "asc",
    filterColumn: null, filterQuery: null,
  });
  const lineOptions = linePageData?.items ?? [];

  const ticketScope = useMemo(
    () => (scope && lineCode && date ? { date, lineCode, ...scope } : null),
    [date, lineCode, scope],
  );

  const { data: ticket, isLoading } = useGetDailyProductionTimeTicket(ticketScope);
  const [rows, setRows] = useState<DailyProductionTimeTicketEntry[]>([]);

  useEffect(() => {
    setRows(ticket?.entries ?? []);
  }, [ticket]);

  const scopedRows = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        date: ticketScope?.date ?? r.date,
        lineCode: ticketScope?.lineCode ?? r.lineCode,
        buyerCode: ticketScope?.buyerCode ?? r.buyerCode,
        order: ticketScope?.order ?? r.order,
        typeCode: ticketScope?.typeCode ?? r.typeCode,
        styleCode: ticketScope?.styleCode ?? r.styleCode,
      })),
    [rows, ticketScope],
  );

  return (
    <div className="flex flex-col w-[85%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Daily Production Time Ticket</Typography>
        </ThemeProvider>
      </div>

      <Box sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 1, backgroundColor: "#fafafa" }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              label="Date of Production" type="date" size="small" fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={date} onChange={(e) => setDate(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              select label="Line No" size="small" fullWidth
              value={lineCode} onChange={(e) => setLineCode(e.target.value)}
            >
              {lineOptions.map((l) => (
                <MenuItem key={l.lineCode} value={l.lineCode}>{l.lineCode} - {l.description}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>

      <StyleScopePicker onScopeChange={setScope} />

      {ticketScope && (
        <>
          <Box>
            <DailyProductionTimeTicketTable
              scope={ticketScope}
              rows={scopedRows}
              setRows={setRows}
              isLoading={isLoading}
            />
          </Box>

          {ticket && ticket.employeeSummaries.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Employee efficiency summary</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Work Hrs</TableCell>
                    <TableCell>NP Hrs</TableCell>
                    <TableCell>Earned Min.</TableCell>
                    <TableCell>Over Eff. %</TableCell>
                    <TableCell>Operator Eff. %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ticket.employeeSummaries.map((s) => (
                    <TableRow key={s.employeeCode}>
                      <TableCell>{s.employeeCode}</TableCell>
                      <TableCell>{s.workHours.toFixed(2)}</TableCell>
                      <TableCell>{s.nonProductiveHours.toFixed(2)}</TableCell>
                      <TableCell>{s.earnedMinutes.toFixed(2)}</TableCell>
                      <TableCell>{s.overEfficiencyPercent.toFixed(2)}</TableCell>
                      <TableCell>{s.operatorEfficiencyPercent.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </>
      )}
    </div>
  );
};

export default DailyProductionTimeTicketWorkspace;
