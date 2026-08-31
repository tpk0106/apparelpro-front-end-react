import { useMemo, useState } from "react";
import type { Style } from "../../interfaces/order-management/Style";
import type { Buyer } from "../../interfaces/references/Buyer";
import type { GarmentType } from "../../interfaces/references/GarmentType";
import type {
  GarmentTypeServiceModel,
  SelectedScopeContext,
} from "../material-consumption/material-consumption.types";
import {
  useGetAllGarmentTypes,
  useGetAllPurchaseOrdersByBuyerCode,
  useGetBuyersQuery,
  useGetStylesByScope,
} from "../../tanstack-hooks/custom-hooks";
import { Autocomplete, Card, Grid, TextField } from "@mui/material";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../themes/useDropdownTheme";

interface StyleSelectionComponentProps {
  onScopeChange: (scope: SelectedScopeContext | null) => void;
}

const StyleSelection = ({ onScopeChange }: StyleSelectionComponentProps) => {
  const { listboxSx: autocompleteListboxSx } = useDropdownTheme();
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<GarmentType | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);

  // Fetch Buyers Registry
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

  // Cascade Dependent Requests
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

  // --- EVENT HANDLERS ---
  const handleBuyerChange = (buyerObj: Buyer | null) => {
    setSelectedBuyer(buyerObj);
    setSelectedOrder(null);
    setSelectedType(null);
    setSelectedStyle(null);
    onScopeChange(null);
  };

  const handleOrderChange = (orderCode: string | null) => {
    setSelectedOrder(orderCode);
    setSelectedType(null);
    setSelectedStyle(null);
    onScopeChange(null);
  };

  const handleTypeChange = (typeObj: GarmentTypeServiceModel | null) => {
    setSelectedType(typeObj);
    setSelectedStyle(null);
    onScopeChange(null);
  };

  const handleStyleChange = (styleObj: Style | null) => {
    setSelectedStyle(styleObj);
    onScopeChange(null);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: DASHBOARD_COLORS.cardBg,
        border: `1px solid ${DASHBOARD_COLORS.border}`,
      }}
    >
      {/* Expanded grid spacing wrapper for clean 5-column or double-row rendering */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            slotProps={{ listbox: { sx: autocompleteListboxSx } }}
            options={buyersList}
            getOptionLabel={(option: Buyer) => option.name || ""}
            value={selectedBuyer}
            onChange={(_, val) => handleBuyerChange(val)}
            isOptionEqualToValue={(option, value) =>
              option.buyerCode === value?.buyerCode
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Buyer"
                size="small"
                // sx={{ backgroundColor: "#000", borderRadius: "4px" }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Autocomplete
            slotProps={{ listbox: { sx: autocompleteListboxSx } }}
            options={ordersList}
            getOptionLabel={(option: string) => option || ""}
            disabled={!selectedBuyer}
            value={selectedOrder}
            onChange={(_, val) => handleOrderChange(val)}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Purchase Order"
                size="small"
                sx={{ borderRadius: "4px" }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Autocomplete
            slotProps={{ listbox: { sx: autocompleteListboxSx } }}
            options={globalTypesList}
            getOptionLabel={(option: GarmentTypeServiceModel) =>
              option.typeName.toUpperCase() || ""
            }
            disabled={!selectedOrder}
            value={selectedType}
            onChange={(_, val) => handleTypeChange(val)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField {...params} label="Select Garment Type" size="small" />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Autocomplete
            slotProps={{ listbox: { sx: autocompleteListboxSx } }}
            options={stylesList}
            disabled={!selectedType}
            getOptionLabel={(option: Style) =>
              option.styleCode
                ? `${option.styleCode} (${Number(option.quantity) || 0})`
                : ""
            }
            value={selectedStyle}
            onChange={(_, val) => handleStyleChange(val)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField {...params} label="Select Active Style" size="small" />
            )}
          />
        </Grid>
      </Grid>
    </Card>
  );
};

export default StyleSelection;
