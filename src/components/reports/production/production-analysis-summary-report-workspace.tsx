import { useMemo, useState } from "react";
import {
  Alert, Autocomplete, Box, Button, Card, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, ThemeProvider, Typography,
} from "@mui/material";
import type { Buyer } from "../../../interfaces/references/Buyer";
import type { GarmentType } from "../../../interfaces/references/GarmentType";
import type { Style } from "../../../interfaces/OrderManagement/Style";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
  useGetAllGarmentTypes,
  useGetStylesByScope,
} from "../../../tanstack-hooks/custom-hooks";
import {
  useGetProductionAnalysisSummaryReport,
  useDownloadProductionAnalysisSummaryReportPdfMutation,
} from "../../../tanstack-hooks/production-analysis-summary-report.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import { withReadableReportTable } from "../../../themes/report-table-theme";

const selectFieldSx = {
  "& .MuiOutlinedInput-input": { color: "#F4F6F8" },
};

const ProductionAnalysisSummaryReportWorkspace = () => {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<GarmentType | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);

  const { data: buyerPageData } = useGetBuyersQuery({
    pageIndex: 0, pageSize: 999, sortColumn: "name", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const buyersList = useMemo<Buyer[]>(() => buyerPageData?.items || [], [buyerPageData]);

  const { data: ordersList = [] } = useGetAllPurchaseOrdersByBuyerCode(selectedBuyer?.buyerCode ?? 0, !!selectedBuyer);
  const { data: globalTypesList = [] } = useGetAllGarmentTypes();
  const { data: stylesList = [] } = useGetStylesByScope(
    { buyerCode: selectedBuyer?.buyerCode ?? 0, order: selectedOrder ?? "", typeCode: selectedType?.id ?? 0 },
    !!selectedBuyer && !!selectedOrder && !!selectedType,
  );

  const scope = selectedBuyer && selectedOrder && selectedType && selectedStyle
    ? { buyerCode: selectedBuyer.buyerCode, order: selectedOrder, typeCode: selectedType.id, styleCode: selectedStyle.styleCode }
    : null;

  const { data: report, isLoading, isError, error } = useGetProductionAnalysisSummaryReport(scope);
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadProductionAnalysisSummaryReportPdfMutation();

  let lastRowKey = "";

  return (
    <div className="flex flex-col w-[95%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Production Analysis Summary (Style)</Typography>
        </ThemeProvider>
      </div>

      <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              options={buyersList}
              getOptionLabel={(option) => option.name || ""}
              value={selectedBuyer}
              onChange={(_, val) => { setSelectedBuyer(val); setSelectedOrder(null); setSelectedType(null); setSelectedStyle(null); }}
              isOptionEqualToValue={(option, value) => option.buyerCode === value?.buyerCode}
              renderInput={(params) => <TextField {...params} label="Buyer" size="small" sx={selectFieldSx} />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              options={ordersList}
              disabled={!selectedBuyer}
              value={selectedOrder}
              onChange={(_, val) => { setSelectedOrder(val); setSelectedType(null); setSelectedStyle(null); }}
              renderInput={(params) => <TextField {...params} label="Order" size="small" sx={selectFieldSx} />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              options={globalTypesList}
              getOptionLabel={(option) => option.typeName.toUpperCase() || ""}
              disabled={!selectedOrder}
              value={selectedType}
              onChange={(_, val) => { setSelectedType(val); setSelectedStyle(null); }}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => <TextField {...params} label="Garment Type" size="small" sx={selectFieldSx} />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              options={stylesList}
              disabled={!selectedType}
              getOptionLabel={(option) => option.styleCode || ""}
              value={selectedStyle}
              onChange={(_, val) => setSelectedStyle(val)}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => <TextField {...params} label="Style" size="small" sx={selectFieldSx} />}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            disabled={!report || isDownloading || !scope}
            onClick={() => downloadPdf(scope!)}
          >
            {isDownloading ? "Preparing PDF..." : "Print / Download PDF"}
          </Button>
        </Box>
      </Card>

      {isLoading && <Typography>Loading...</Typography>}
      {isError && <Alert severity="info">{error.message}</Alert>}

      {report && (
        <>
          <ThemeProvider theme={withReadableReportTable}>
            <TableContainer component={Card} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Line</TableCell>
                    {report.sectionDescriptions.map((d) => (
                      <TableCell key={d} align="right">{d}</TableCell>
                    ))}
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.rows.map((row, i) => {
                    const showDate = row.date !== lastRowKey;
                    lastRowKey = row.date;
                    return (
                      <TableRow key={`${row.date}-${row.lineCode}-${i}`}>
                        <TableCell>{showDate ? row.date : ""}</TableCell>
                        <TableCell>{row.lineCode}</TableCell>
                        {report.sectionCodes.map((code) => (
                          <TableCell key={code} align="right">
                            {(row.sectionQuantities.find((s) => s.sectionCode === code)?.quantity ?? 0).toLocaleString()}
                          </TableCell>
                        ))}
                        <TableCell align="right">{row.total.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableCell colSpan={2} sx={{ fontWeight: "bold" }}>TOTAL</TableCell>
                    {report.sectionCodes.map((code) => (
                      <TableCell key={code} align="right" sx={{ fontWeight: "bold" }}>
                        {(report.sectionTotals.find((s) => s.sectionCode === code)?.quantity ?? 0).toLocaleString()}
                      </TableCell>
                    ))}
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      {report.sectionTotals.reduce((sum, s) => sum + s.quantity, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </ThemeProvider>

          <Card variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography sx={{ color: "#F4F6F8" }}>
              AVERAGE PRODUCTION QUANTITY ON FINAL OUTPUT - {report.finalSectionDescription}: {" "}
              {report.averageProductionQuantityOnFinalOutput.toFixed(2)} [{report.finalOutputProductionDays} day(s)]
            </Typography>
            <Typography sx={{ mt: 1, color: "#F4F6F8" }}>
              Total No. of days taken for Production: {report.totalDaysTakenForProduction}
            </Typography>
          </Card>
        </>
      )}

      {!isLoading && !isError && !report && (
        <Typography color="text.secondary">Select a Buyer, Order, Type and Style to see the production analysis.</Typography>
      )}
    </div>
  );
};

export default ProductionAnalysisSummaryReportWorkspace;
