import { useState } from "react";
import { Autocomplete, Card, Grid, TextField, type SxProps, type Theme } from "@mui/material";
import type { Buyer } from "../../../interfaces/references/Buyer";
import type { Style } from "../../../interfaces/OrderManagement/Style";
import type { GarmentTypeServiceModel } from "../../material-consumption/material-consumption.types";
import {
  useGetAllGarmentTypes,
  useGetAllPurchaseOrdersByBuyerCode,
  useGetBuyersQuery,
  useGetStylesByScope,
} from "../../../tanstack-hooks/custom-hooks";

export interface StyleScope {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
}

interface Props {
  onScopeChange: (scope: StyleScope | null) => void;
  // Lets a caller override the card's look (background/border/etc.) without
  // touching the default here - the default (#fafafa) is what every other
  // screen using this picker still relies on.
  sx?: SxProps<Theme>;
}

// Deliberately separate from components/common/style-selection.component.tsx:
// that component is still in progress (never actually fires onScopeChange once
// a style is picked) and its output type carries Material Consumption-specific
// fields (bulkQuantity, currencyCode) that don't belong in Production Control.
// Reuses the same underlying TanStack hooks, just a narrower callback shape.
const StyleScopePicker = ({ onScopeChange, sx }: Props) => {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<GarmentTypeServiceModel | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);

  const { data: buyerPageData } = useGetBuyersQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "name",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const buyersList = buyerPageData?.items ?? [];

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
    if (styleObj && selectedBuyer && selectedOrder && selectedType) {
      onScopeChange({
        buyerCode: selectedBuyer.buyerCode,
        order: selectedOrder,
        typeCode: selectedType.id,
        styleCode: styleObj.styleCode,
      });
    } else {
      onScopeChange(null);
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: "#fafafa", ...sx }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={buyersList}
            getOptionLabel={(option: Buyer) => option.name || ""}
            value={selectedBuyer}
            onChange={(_, val) => handleBuyerChange(val)}
            isOptionEqualToValue={(option, value) => option.buyerCode === value?.buyerCode}
            renderInput={(params) => <TextField {...params} label="Select Buyer" size="small" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Autocomplete
            options={ordersList}
            getOptionLabel={(option: string) => option || ""}
            disabled={!selectedBuyer}
            value={selectedOrder}
            onChange={(_, val) => handleOrderChange(val)}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => <TextField {...params} label="Select Order" size="small" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Autocomplete
            options={globalTypesList}
            getOptionLabel={(option: GarmentTypeServiceModel) => option.typeName.toUpperCase() || ""}
            disabled={!selectedOrder}
            value={selectedType}
            onChange={(_, val) => handleTypeChange(val)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => <TextField {...params} label="Select Garment Type" size="small" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Autocomplete
            options={stylesList}
            disabled={!selectedType}
            getOptionLabel={(option: Style) => option.styleCode || ""}
            value={selectedStyle}
            onChange={(_, val) => handleStyleChange(val)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => <TextField {...params} label="Select Style" size="small" />}
          />
        </Grid>
      </Grid>
    </Card>
  );
};

export default StyleScopePicker;
