import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
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
  useGetProductionScheduleReport,
  useDownloadProductionScheduleReportPdfMutation,
} from "../../../tanstack-hooks/production-schedule-report.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import { withReadableReportTable } from "../../../themes/report-table-theme";

const today = () => new Date().toISOString().slice(0, 10);
const inOneMonth = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
};

// The app-wide theme forces date-input text to #141922 (near-black), meant
// for a light input fill - these Cards have no background override so they
// render on the theme's dark paper (#141922), making the date text and the
// browser's native calendar icon both effectively invisible. Same fix as
// Production Summary (Daily)'s date field.
const dateFieldSx = {
  "& .MuiOutlinedInput-input": { color: "#F4F6F8" },
  "& input::-webkit-calendar-picker-indicator": { filter: "invert(1)" },
};

const ProductionScheduleReportWorkspace = () => {
  const [fromDate, setFromDate] = useState(today());
  const [toDate, setToDate] = useState(inOneMonth());
  const { data: report, isLoading, isError, error } = useGetProductionScheduleReport(fromDate, toDate);
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadProductionScheduleReportPdfMutation();

  return (
    <div className="flex flex-col w-[90%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Production Schedule</Typography>
        </ThemeProvider>
      </div>

      <Card variant="outlined" sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          label="From Date" type="date" size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          value={fromDate} onChange={(e) => setFromDate(e.target.value)}
          sx={dateFieldSx}
        />
        <TextField
          label="To Date" type="date" size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          value={toDate} onChange={(e) => setToDate(e.target.value)}
          sx={dateFieldSx}
        />
        <Button
          variant="contained"
          disabled={!report || isDownloading}
          onClick={() => downloadPdf({ fromDate, toDate })}
        >
          {isDownloading ? "Preparing PDF..." : "Print / Download PDF"}
        </Button>
      </Card>

      {isLoading && <Typography>Loading...</Typography>}

      {isError && <Alert severity="info">{error.message}</Alert>}

      {report && (
        <ThemeProvider theme={withReadableReportTable}>
        <TableContainer component={Card} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Line</TableCell>
                <TableCell>Est. Start</TableCell>
                <TableCell>Est. End</TableCell>
                <TableCell>Buyer</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Style</TableCell>
                <TableCell>Shipment</TableCell>
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
              {report.lines.map((line, index) => (
                <TableRow key={`${line.lineCode}-${line.buyerCode}-${line.order}-${line.styleCode}-${line.shipmentOrder}-${index}`}>
                  <TableCell>{line.lineCode}</TableCell>
                  <TableCell>{line.estimatedStartDate}</TableCell>
                  <TableCell>{line.estimatedEndDate}</TableCell>
                  <TableCell>{line.buyerName}</TableCell>
                  <TableCell>{line.order}</TableCell>
                  <TableCell>{line.styleCode}</TableCell>
                  <TableCell>{line.shipmentOrder}</TableCell>
                  <TableCell align="right">{line.estimatedProductionPerDay.toLocaleString()}</TableCell>
                  <TableCell>{line.unit}</TableCell>
                  <TableCell align="right">{line.leadTimeDays}</TableCell>
                  <TableCell align="right">{line.numberOfDays}</TableCell>
                  <TableCell align="right">{line.totalQuantity.toLocaleString()}</TableCell>
                  <TableCell>{line.shipDate ?? "-"}</TableCell>
                  <TableCell align="right">
                    {line.floatDays !== null ? (
                      <Chip
                        size="small"
                        label={line.floatDays}
                        color={line.floatDays < 0 ? "error" : "success"}
                      />
                    ) : "-"}
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
          <Typography color="text.secondary">Pick a date range to see the production schedule.</Typography>
        </Box>
      )}
    </div>
  );
};

export default ProductionScheduleReportWorkspace;
