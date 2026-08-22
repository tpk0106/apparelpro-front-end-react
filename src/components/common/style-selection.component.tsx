import { useMemo, useState } from "react";
import type { Style } from "../../interfaces/OrderManagement/Style";
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

interface StyleSelectionComponentProps {
  onScopeChange: (scope: SelectedScopeContext | null) => void;
}

const StyleSelection = ({ onScopeChange }: StyleSelectionComponentProps) => {
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
    <Card variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: "#fafafa" }}>
      {/* Expanded grid spacing wrapper for clean 5-column or double-row rendering */}
      <Grid container spacing={2} sx={{ color: "#ffffff", border: "#0000ff" }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            // V9 uses explicit slot mapping configurations
            slotProps={{
              listbox: {
                sx: {
                  // 1. Force override the background of the active selected option
                  '& .MuiAutocomplete-option[aria-selected="true"]': {
                    backgroundColor: "lightblue !important", // V9 CSS variables require !important to break theme ties
                    color: "#000000",
                  },

                  // 2. Clear out or change the color when you hover over the already selected item
                  '& .MuiAutocomplete-option[aria-selected="true"].Mui-focused':
                    {
                      backgroundColor: "#00bfff !important",
                    },

                  // 3. Optional: Style normal (unselected) items when hovered
                  "& .MuiAutocomplete-option.Mui-focused": {
                    backgroundColor: "#8ab17d",
                  },
                },
              },
            }}
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

        <Grid
          size={{ xs: 12, sm: 6, md: 2 }}
          sx={{ color: "#ffffff", border: "#0000ff" }}
        >
          <Autocomplete
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
