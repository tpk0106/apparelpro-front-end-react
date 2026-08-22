import { useState } from "react";
import {
  Alert, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, ThemeProvider, Typography,
} from "@mui/material";
import {
  useGetProductionSummaryStyleWiseReport,
  useDownloadProductionSummaryStyleWiseReportPdfMutation,
} from "../../../tanstack-hooks/production-summary-style-wise-report.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import { withReadableReportTable } from "../../../themes/report-table-theme";
import { DateRangeFilterCard } from "./production-summary-style-wise-report-shared";

const ProductionSummaryStyleWiseReportWorkspace = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { data: report, isLoading, isError, error } =
    useGetProductionSummaryStyleWiseReport(startDate || null, endDate || null);
  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadProductionSummaryStyleWiseReportPdfMutation();

  return (
    <div className="flex flex-col w-[95%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Production Summary (Style Wise)</Typography>
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
        captionText={report ? `Value uses final section: ${report.finalSectionDescription}` : undefined}
      />

      {isLoading && <Typography>Loading...</Typography>}
      {isError && <Alert severity="info">{error.message}</Alert>}

      {report && (
        <ThemeProvider theme={withReadableReportTable}>
          <TableContainer component={Card} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Buyer</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Style</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Order Qty</TableCell>
                  {report.sectionDescriptions.map((d) => (
                    <TableCell key={d} align="right">{d}</TableCell>
                  ))}
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell>Basis</TableCell>
                  <TableCell align="right">Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.rows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.buyerName}</TableCell>
                    <TableCell>{row.order}</TableCell>
                    <TableCell>{row.styleCode}</TableCell>
                    <TableCell>{row.description ?? "-"}</TableCell>
                    <TableCell align="right">{row.orderQty.toLocaleString()} {row.unit}</TableCell>
                    {report.sectionCodes.map((code) => (
                      <TableCell key={code} align="right">
                        {(row.sectionQuantities.find((s) => s.sectionCode === code)?.quantity ?? 0).toLocaleString()}
                      </TableCell>
                    ))}
                    <TableCell align="right">{row.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>{row.basisCode ?? "-"}</TableCell>
                    <TableCell align="right">{row.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ThemeProvider>
      )}

      {!isLoading && !isError && !report && (
        <Typography color="text.secondary">Pick a date range to see the production summary.</Typography>
      )}
    </div>
  );
};

export default ProductionSummaryStyleWiseReportWorkspace;
