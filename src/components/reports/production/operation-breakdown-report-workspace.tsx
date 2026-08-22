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
  useGetOperationBreakdownReport,
  useDownloadOperationBreakdownReportPdfMutation,
} from "../../../tanstack-hooks/operation-breakdown-report.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import { withReadableReportTable } from "../../../themes/report-table-theme";

const selectFieldSx = {
  "& .MuiOutlinedInput-input": { color: "#F4F6F8" },
};

const OperationBreakdownReportWorkspace = () => {
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

  const { data: report, isLoading, isError, error } = useGetOperationBreakdownReport(scope);
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadOperationBreakdownReportPdfMutation();

  return (
    <div className="flex flex-col w-[95%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Operation Breakdown</Typography>
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
          {report && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Eff1: {report.eff1Percent}% · Eff2: {report.eff2Percent}% · Work Hours/Day: {report.workHoursPerDay}
            </Typography>
          )}
        </Box>
      </Card>

      {isLoading && <Typography>Loading...</Typography>}
      {isError && <Alert severity="info">{error.message}</Alert>}

      {report && report.groups.map((group) => (
        <Box key={group.componentCode} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            {group.componentCode} — {group.componentDescription}
          </Typography>
          <ThemeProvider theme={withReadableReportTable}>
            <TableContainer component={Card} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Oper. No</TableCell>
                    <TableCell>Oper. Code</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Machine</TableCell>
                    <TableCell align="right">SAM</TableCell>
                    <TableCell align="right">Quota @100%</TableCell>
                    <TableCell align="right">{`Quota @${report.eff1Percent}%`}</TableCell>
                    <TableCell align="right">{`Pcs/2Hrs @${report.eff1Percent}%`}</TableCell>
                    <TableCell align="right">{`Quota @${report.eff2Percent}%`}</TableCell>
                    <TableCell align="right">{`Pcs/2Hrs @${report.eff2Percent}%`}</TableCell>
                    <TableCell align="right">No. Mach.</TableCell>
                    <TableCell align="right">No. Operators</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.rows.map((row) => (
                    <TableRow key={row.displayOperationNo}>
                      <TableCell>{row.displayOperationNo}</TableCell>
                      <TableCell>{row.operationCode}</TableCell>
                      <TableCell>{row.operationDescription}</TableCell>
                      <TableCell>{row.machineTypeCode}</TableCell>
                      <TableCell align="right">{row.sam.toFixed(2)}</TableCell>
                      <TableCell align="right">{row.quotaAt100.toFixed(0)}</TableCell>
                      <TableCell align="right">{row.quotaAtEff1.toFixed(0)}</TableCell>
                      <TableCell align="right">{row.quotaPcsPer2HrsAtEff1.toFixed(0)}</TableCell>
                      <TableCell align="right">{row.quotaAtEff2.toFixed(0)}</TableCell>
                      <TableCell align="right">{row.quotaPcsPer2HrsAtEff2.toFixed(0)}</TableCell>
                      <TableCell align="right">{row.numberOfMachines.toFixed(2)}</TableCell>
                      <TableCell align="right">{row.numberOfOperators}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </ThemeProvider>
        </Box>
      ))}

      {!isLoading && !isError && !report && (
        <Typography color="text.secondary">Select a Buyer, Order, Type and Style to see the operation breakdown.</Typography>
      )}
    </div>
  );
};

export default OperationBreakdownReportWorkspace;
