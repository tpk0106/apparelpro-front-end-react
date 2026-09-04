import { useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Card,
  Grid,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import type { Buyer } from "../../../interfaces/references/Buyer";
import type { GarmentType } from "../../../interfaces/references/GarmentType";
import type { Style } from "../../../interfaces/order-management/Style";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
  useGetAllGarmentTypes,
  useGetStylesByScope,
} from "../../../tanstack-hooks/custom-hooks";
import { useGetProductionProgressReport } from "../../../tanstack-hooks/production-progress-report.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import ProductionProgressChart from "./production-progress-chart.component";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../../themes/useDropdownTheme";
import { workspaceHeadingSx, workspaceSectionLabelSx } from "../../../themes/workspace-theme";

const ProductionProgressGraph = () => {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<GarmentType | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);

  const { data: buyerPageData } = useGetBuyersQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "name",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const buyersList = useMemo<Buyer[]>(
    () => buyerPageData?.items || [],
    [buyerPageData],
  );

  const { data: ordersList = [] } = useGetAllPurchaseOrdersByBuyerCode(
    selectedBuyer?.buyerCode ?? 0,
    !!selectedBuyer,
  );
  const { data: globalTypesList = [] } = useGetAllGarmentTypes();
  const { data: stylesList = [] } = useGetStylesByScope(
    {
      buyerCode: selectedBuyer?.buyerCode ?? 0,
      order: selectedOrder ?? "",
      typeCode: selectedType?.id ?? 0,
    },
    !!selectedBuyer && !!selectedOrder && !!selectedType,
  );

  const scope =
    selectedBuyer && selectedOrder && selectedType && selectedStyle
      ? {
          buyerCode: selectedBuyer.buyerCode,
          order: selectedOrder,
          typeCode: selectedType.id,
          styleCode: selectedStyle.styleCode,
        }
      : null;

  const {
    data: report,
    isLoading,
    isError,
    error,
  } = useGetProductionProgressReport(scope);

  return (
    <div className="flex flex-col w-[95%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography sx={workspaceHeadingSx}>Production Progress Graph</Typography>
        </ThemeProvider>
      </div>

      <Card
        variant="outlined"
        sx={{ p: 2, mb: 2, backgroundColor: DASHBOARD_COLORS.cardBg, borderColor: DASHBOARD_COLORS.border }}
      >
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              options={buyersList}
              getOptionLabel={(option) => option.name || ""}
              value={selectedBuyer}
              onChange={(_, val) => {
                setSelectedBuyer(val);
                setSelectedOrder(null);
                setSelectedType(null);
                setSelectedStyle(null);
              }}
              isOptionEqualToValue={(option, value) =>
                option.buyerCode === value?.buyerCode
              }
              slotProps={{ listbox: { sx: dropdownListboxSx } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buyer"
                  size="small"
                  sx={dropdownFieldSx}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              options={ordersList}
              disabled={!selectedBuyer}
              value={selectedOrder}
              onChange={(_, val) => {
                setSelectedOrder(val);
                setSelectedType(null);
                setSelectedStyle(null);
              }}
              slotProps={{ listbox: { sx: dropdownListboxSx } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Order"
                  size="small"
                  sx={dropdownFieldSx}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              options={globalTypesList}
              getOptionLabel={(option) => option.typeName.toUpperCase() || ""}
              disabled={!selectedOrder}
              value={selectedType}
              onChange={(_, val) => {
                setSelectedType(val);
                setSelectedStyle(null);
              }}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              slotProps={{ listbox: { sx: dropdownListboxSx } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Garment Type"
                  size="small"
                  sx={dropdownFieldSx}
                />
              )}
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
              slotProps={{ listbox: { sx: dropdownListboxSx } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Style"
                  size="small"
                  sx={dropdownFieldSx}
                />
              )}
            />
          </Grid>
        </Grid>
      </Card>

      {isLoading && <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>Loading...</Typography>}
      {isError && <Alert severity="info">{error.message}</Alert>}

      {report && (
        <Card
          variant="outlined"
          sx={{ p: 2, backgroundColor: DASHBOARD_COLORS.cardBg, borderColor: DASHBOARD_COLORS.border }}
        >
          <Typography variant="subtitle2" sx={{ ...workspaceSectionLabelSx, mb: 1 }}>
            Production Progress for Buyer: {report.buyerName} — Order:{" "}
            {report.order} — Style: {report.styleCode}
          </Typography>
          <Typography
            variant="caption"
            sx={{ mb: 2, display: "block", color: DASHBOARD_COLORS.textSecondary }}
          >
            Actual is measured on the final section:{" "}
            {report.finalSectionDescription}
          </Typography>
          <ProductionProgressChart
            estimatedSeries={report.estimatedSeries}
            actualSeries={report.actualSeries}
          />
        </Card>
      )}

      {!isLoading && !isError && !report && (
        <Typography color="text.secondary">
          Select a Buyer, Order, Type and Style to see the production progress.
        </Typography>
      )}
    </div>
  );
};

export default ProductionProgressGraph;
