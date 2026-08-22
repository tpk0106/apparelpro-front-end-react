import { Fragment, useState } from "react";
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
  useGetProductionSummaryDailyReport,
  useDownloadProductionSummaryDailyReportPdfMutation,
} from "../../../tanstack-hooks/production-summary-daily-report.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import { withReadableReportTable } from "../../../themes/report-table-theme";

const today = () => new Date().toISOString().slice(0, 10);

const ProductionSummaryDailyReportWorkspace = () => {
  const [date, setDate] = useState(today());
  const { data: report, isLoading, isError, error } = useGetProductionSummaryDailyReport(date);
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadProductionSummaryDailyReportPdfMutation();

  return (
    <div className="flex flex-col w-[90%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Production Summary (Daily)</Typography>
        </ThemeProvider>
      </div>

      <Card variant="outlined" sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          label="Date" type="date" size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          value={date} onChange={(e) => setDate(e.target.value)}
          sx={{
            // The app-wide theme forces input text to #141922 (near-black),
            // meant for a light input fill - this Card has no background
            // override so it renders on the theme's dark paper (#141922),
            // making the date text and the browser's native calendar icon
            // both effectively invisible.
            "& .MuiOutlinedInput-input": { color: "#F4F6F8" },
            "& input::-webkit-calendar-picker-indicator": { filter: "invert(1)" },
          }}
        />
        <Button
          variant="contained"
          disabled={!report || isDownloading}
          onClick={() => downloadPdf(date)}
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
                <TableCell rowSpan={2}>Buyer</TableCell>
                <TableCell rowSpan={2}>Order</TableCell>
                <TableCell rowSpan={2}>Style</TableCell>
                <TableCell rowSpan={2}>Description</TableCell>
                <TableCell rowSpan={2} align="right">Order Qty</TableCell>
                <TableCell rowSpan={2}>Line</TableCell>
                {report.sectionDescriptions.map((desc) => (
                  <TableCell key={desc} colSpan={3} align="center">{desc}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                {report.sectionCodes.map((code) => (
                  <Fragment key={code}>
                    <TableCell align="right">Pro Qty</TableCell>
                    <TableCell align="right">To-Date</TableCell>
                    <TableCell align="right">Balance</TableCell>
                  </Fragment>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {report.lines.map((line) => (
                <TableRow key={`${line.buyerCode}-${line.order}-${line.typeCode}-${line.styleCode}-${line.lineCode}`}>
                  <TableCell>{line.buyerName}</TableCell>
                  <TableCell>{line.order}</TableCell>
                  <TableCell>{line.styleCode}</TableCell>
                  <TableCell>{line.description || "-"}</TableCell>
                  <TableCell align="right">{line.orderQuantity.toLocaleString()} {line.unit}</TableCell>
                  <TableCell>{line.lineCode}</TableCell>
                  {line.sections.map((section) => (
                    <Fragment key={section.sectionCode}>
                      <TableCell align="right">{section.proQuantity.toLocaleString()}</TableCell>
                      <TableCell align="right">{section.toDateQuantity.toLocaleString()}</TableCell>
                      <TableCell align="right">{section.balance.toLocaleString()}</TableCell>
                    </Fragment>
                  ))}
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4}><b>Total</b></TableCell>
                <TableCell align="right"><b>{report.totalOrderQuantity.toLocaleString()}</b></TableCell>
                <TableCell />
                {report.totals.map((total) => (
                  <Fragment key={total.sectionCode}>
                    <TableCell align="right"><b>{total.proQuantity.toLocaleString()}</b></TableCell>
                    <TableCell align="right"><b>{total.toDateQuantity.toLocaleString()}</b></TableCell>
                    <TableCell align="right"><b>{total.balance.toLocaleString()}</b></TableCell>
                  </Fragment>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        </ThemeProvider>
      )}

      {!isLoading && !isError && !report && (
        <Box>
          <Typography color="text.secondary">Pick a date to see production entered that day.</Typography>
        </Box>
      )}
    </div>
  );
};

export default ProductionSummaryDailyReportWorkspace;
