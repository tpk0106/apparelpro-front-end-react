import { useMemo, useState } from "react";
import {
  Alert, Autocomplete, Box, Button, Card, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, ThemeProvider, Typography,
} from "@mui/material";
import type { Buyer } from "../../../interfaces/references/Buyer";
import type { GarmentType } from "../../../interfaces/references/GarmentType";
import type { Style } from "../../../interfaces/OrderManagement/Style";
import type { ProductionLine } from "../../../interfaces/production/ProductionLine";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
  useGetAllGarmentTypes,
  useGetStylesByScope,
} from "../../../tanstack-hooks/custom-hooks";
import { useGetProductionLines } from "../../../tanstack-hooks/production-reference.hooks";
import {
  useGetManpowerRequirementReport,
  useDownloadManpowerRequirementReportPdfMutation,
} from "../../../tanstack-hooks/manpower-requirement-report.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import { withReadableReportTable } from "../../../themes/report-table-theme";

const selectFieldSx = {
  "& .MuiOutlinedInput-input": { color: "#F4F6F8" },
};

const fmt = (value: number | null) => (value === null ? "-" : value.toLocaleString(undefined, { maximumFractionDigits: 2 }));

const ManpowerRequirementReportWorkspace = () => {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<GarmentType | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [selectedLine, setSelectedLine] = useState<ProductionLine | null>(null);

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

  const { data: linePageData } = useGetProductionLines({
    pageIndex: 0, pageSize: 999, sortColumn: "lineCode", sortOrder: "asc", filterColumn: null, filterQuery: null,
  });
  const linesList = useMemo<ProductionLine[]>(() => linePageData?.items || [], [linePageData]);

  const scope = selectedBuyer && selectedOrder && selectedType && selectedStyle
    ? {
        buyerCode: selectedBuyer.buyerCode, order: selectedOrder, typeCode: selectedType.id,
        styleCode: selectedStyle.styleCode, lineCode: selectedLine?.lineCode ?? null,
      }
    : null;

  const { data: report, isLoading, isError, error } = useGetManpowerRequirementReport(scope);
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadManpowerRequirementReportPdfMutation();

  return (
    <div className="flex flex-col w-[95%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Manpower Requirement</Typography>
        </ThemeProvider>
      </div>

      <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Autocomplete
              options={buyersList}
              getOptionLabel={(option) => option.name || ""}
              value={selectedBuyer}
              onChange={(_, val) => { setSelectedBuyer(val); setSelectedOrder(null); setSelectedType(null); setSelectedStyle(null); }}
              isOptionEqualToValue={(option, value) => option.buyerCode === value?.buyerCode}
              renderInput={(params) => <TextField {...params} label="Buyer" size="small" sx={selectFieldSx} />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Autocomplete
              options={ordersList}
              disabled={!selectedBuyer}
              value={selectedOrder}
              onChange={(_, val) => { setSelectedOrder(val); setSelectedType(null); setSelectedStyle(null); }}
              renderInput={(params) => <TextField {...params} label="Order" size="small" sx={selectFieldSx} />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
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
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
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
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
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
            disabled={!report || isDownloading || !scope}
            onClick={() => downloadPdf(scope!)}
          >
            {isDownloading ? "Preparing PDF..." : "Print / Download PDF"}
          </Button>
          {report && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Eff1: {report.eff1Percent}% · Eff2: {report.eff2Percent}% · Work Hours/Day: {report.workHoursPerDay} · Machine Count: {report.machineCount}
              {report.lineCode ? ` (Line ${report.lineCode})` : " (factory default)"}
            </Typography>
          )}
        </Box>
      </Card>

      {isLoading && <Typography>Loading...</Typography>}
      {isError && <Alert severity="info">{error.message}</Alert>}

      {report && (
        <>
          <ThemeProvider theme={withReadableReportTable}>
            <TableContainer component={Card} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={2} sx={{ fontWeight: "bold" }}>Machine-Operated Types</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Type of Machine</TableCell>
                    <TableCell align="right">Time (SAM)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.machineRows.map((row) => (
                    <TableRow key={row.machineTypeCode}>
                      <TableCell>{row.machineTypeDescription}</TableCell>
                      <TableCell align="right">{row.totalSam.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Total Machine Time</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>{report.totalMachineTimeSam.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </ThemeProvider>

          {report.manualRows.length > 0 && (
            <ThemeProvider theme={withReadableReportTable}>
              <TableContainer component={Card} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={2} sx={{ fontWeight: "bold" }}>Manual Types</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Type of Machine</TableCell>
                      <TableCell align="right">Time (SAM)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.manualRows.map((row) => (
                      <TableRow key={row.machineTypeCode}>
                        <TableCell>{row.machineTypeDescription}</TableCell>
                        <TableCell align="right">{row.totalSam.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </ThemeProvider>
          )}

          <ThemeProvider theme={withReadableReportTable}>
            <TableContainer component={Card} variant="outlined">
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Total (Machine + Manual)</TableCell>
                    <TableCell align="right">{report.grandTotalSam.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>PCS per Machine @ 100%</TableCell>
                    <TableCell align="right">{report.pcsPerMachineAt100.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{`PCS per Machine @ ${report.eff1Percent}%`}</TableCell>
                    <TableCell align="right">{report.pcsPerMachineAtEff1.toFixed(2)}</TableCell>
                  </TableRow>
                  {report.pcsPerMachineAtEff2 !== null && (
                    <TableRow>
                      <TableCell>{`PCS per Machine @ ${report.eff2Percent}%`}</TableCell>
                      <TableCell align="right">{report.pcsPerMachineAtEff2.toFixed(2)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Target Output/Day @ 100%</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>{fmt(report.targetOutputAt100)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>{`Target Output/Day @ ${report.eff1Percent}%`}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>{fmt(report.targetOutputAtEff1)}</TableCell>
                  </TableRow>
                  {report.targetOutputAtEff2 !== null && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>{`Target Output/Day @ ${report.eff2Percent}%`}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>{fmt(report.targetOutputAtEff2)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell>Estimated Standard Hours</TableCell>
                    <TableCell align="right">{report.estimatedStandardHours.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </ThemeProvider>
        </>
      )}

      {!isLoading && !isError && !report && (
        <Typography color="text.secondary">Select a Buyer, Order, Type and Style to see the manpower requirement.</Typography>
      )}
    </div>
  );
};

export default ManpowerRequirementReportWorkspace;
