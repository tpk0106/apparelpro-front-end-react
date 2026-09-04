import { useState } from "react";
import {
  Autocomplete,
  Card,
  Grid,
  TextField,
  type SxProps,
  type Theme,
} from "@mui/material";
import type { Buyer } from "../../../interfaces/references/Buyer";
import type { Style } from "../../../interfaces/order-management/Style";
import type { GarmentTypeServiceModel } from "../../material-consumption/material-consumption.types";
import {
  useGetAllGarmentTypes,
  useGetAllPurchaseOrdersByBuyerCode,
  useGetBuyersQuery,
  useGetStylesByScope,
} from "../../../tanstack-hooks/custom-hooks";
import { useDropdownTheme } from "../../../themes/useDropdownTheme";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";

export interface StyleScope {
  buyerCode: number;
  buyerName: string;
  order: string;
  typeCode: number;
  typeName: string;
  styleCode: string;
}

interface Props {
  onScopeChange: (scope: StyleScope | null) => void;
  // Lets a caller override the card's look (background/border/etc.) without
  // touching the default here - the default (DASHBOARD_COLORS.cardBg) is
  // what every other screen using this picker relies on; Dashboard passes
  // its own CARD_SX instead, purely for the extra elevated-shadow look.
  sx?: SxProps<Theme>;
}

// Deliberately separate from components/common/style-selection.component.tsx:
// that component is still in progress (never actually fires onScopeChange once
// a style is picked) and its output type carries Material Consumption-specific
// fields (bulkQuantity, currencyCode) that don't belong in Production Control.
// Reuses the same underlying TanStack hooks, just a narrower callback shape.
const StyleScopePicker = ({ onScopeChange, sx }: Props) => {
  const { fieldSx, listboxSx } = useDropdownTheme();
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedType, setSelectedType] =
    useState<GarmentTypeServiceModel | null>(null);
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
        buyerName: selectedBuyer.name,
        order: selectedOrder,
        typeCode: selectedType.id,
        typeName: selectedType.typeName,
        styleCode: styleObj.styleCode,
      });
    } else {
      onScopeChange(null);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: DASHBOARD_COLORS.cardBg,
        borderColor: DASHBOARD_COLORS.border,
        ...sx,
      }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={buyersList}
            getOptionLabel={(option: Buyer) => option.name || ""}
            value={selectedBuyer}
            onChange={(_, val) => handleBuyerChange(val)}
            isOptionEqualToValue={(option, value) =>
              option.buyerCode === value?.buyerCode
            }
            slotProps={{ listbox: { sx: listboxSx } }}
            renderInput={(params) => (
              <TextField {...params} label="Select Buyer" size="small" sx={fieldSx} />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={ordersList}
            getOptionLabel={(option: string) => option || ""}
            disabled={!selectedBuyer}
            value={selectedOrder}
            onChange={(_, val) => handleOrderChange(val)}
            isOptionEqualToValue={(option, value) => option === value}
            slotProps={{ listbox: { sx: listboxSx } }}
            renderInput={(params) => (
              <TextField {...params} label="Select Order" size="small" sx={fieldSx} />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={globalTypesList}
            getOptionLabel={(option: GarmentTypeServiceModel) =>
              option.typeName.toUpperCase() || ""
            }
            disabled={!selectedOrder}
            value={selectedType}
            onChange={(_, val) => handleTypeChange(val)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            slotProps={{ listbox: { sx: listboxSx } }}
            renderInput={(params) => (
              <TextField {...params} label="Select Garment Type" size="small" sx={fieldSx} />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={stylesList}
            disabled={!selectedType}
            getOptionLabel={(option: Style) => option.styleCode || ""}
            value={selectedStyle}
            onChange={(_, val) => handleStyleChange(val)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            slotProps={{ listbox: { sx: listboxSx } }}
            renderInput={(params) => (
              <TextField {...params} label="Select Style" size="small" sx={fieldSx} />
            )}
          />
        </Grid>
      </Grid>
    </Card>
  );
};

export default StyleScopePicker;
