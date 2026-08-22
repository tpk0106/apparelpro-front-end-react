import { useMemo, useState } from "react";
import { Alert, Autocomplete, Card, Grid, TextField, ThemeProvider, Typography } from "@mui/material";
import type { Buyer } from "../../../interfaces/references/Buyer";
import type { GarmentType } from "../../../interfaces/references/GarmentType";
import type { Style } from "../../../interfaces/OrderManagement/Style";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
  useGetAllGarmentTypes,
  useGetStylesByScope,
} from "../../../tanstack-hooks/custom-hooks";
import { useGetProductionProgressReport } from "../../../tanstack-hooks/production-progress-report.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import ProductionProgressChart from "./production-progress-chart.component";

const selectFieldSx = {
  "& .MuiOutlinedInput-input": { color: "#F4F6F8" },
};

const ProductionProgressGraph = () => {
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

  const { data: report, isLoading, isError, error } = useGetProductionProgressReport(scope);

  return (
    <div className="flex flex-col w-[95%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Production Progress Graph</Typography>
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
      </Card>

      {isLoading && <Typography>Loading...</Typography>}
      {isError && <Alert severity="info">{error.message}</Alert>}

      {report && (
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: "#F4F6F8" }}>
            Production Progress for Buyer: {report.buyerName} — Order: {report.order} — Style: {report.styleCode}
          </Typography>
          <Typography variant="caption" sx={{ mb: 2, display: "block", color: "text.secondary" }}>
            Actual is measured on the final section: {report.finalSectionDescription}
          </Typography>
          <ProductionProgressChart estimatedSeries={report.estimatedSeries} actualSeries={report.actualSeries} />
        </Card>
      )}

      {!isLoading && !isError && !report && (
        <Typography color="text.secondary">Select a Buyer, Order, Type and Style to see the production progress.</Typography>
      )}
    </div>
  );
};

export default ProductionProgressGraph;
