import { useState, useMemo } from "react";
import { Card, TextField, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";

// Import your existing live master lookup hooks directly from your verified service slices
import {
  useGetBuyersPagedQuery,
  useGetOrdersByBuyerQuery,
  useGetAllGarmentTypesQuery,
  useGetStylesByScopeQuery,
} from "../../services/material-consumption.services";

import type { Style } from "../../interfaces/OrderManagement/Style"; // Ensure this relative path targets your project style model
import type { SelectedHeaderContext } from "./stylewise-events.types";
import type { GarmentTypeServiceModel } from "../material-consumption/material-consumption.types";
import type { Buyer } from "../../interfaces/references/Buyer";

interface HeaderSelectorProps {
  // Callback function to broadcast the verified header coordinates up to the workspace controller
  onContextLock: (context: SelectedHeaderContext | null) => void;
}

export default function StylewiseEventsHeader({
  onContextLock,
}: HeaderSelectorProps) {
  // 1. Core Hierarchy Selection States
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedType, setSelectedType] =
    useState<GarmentTypeServiceModel | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);

  // 2. Fetch Master Datasets from your active RTK-Query Service Caches
  const { data: buyerPageData, isLoading: isBuyersLoading } =
    useGetBuyersPagedQuery({
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

  const { data: ordersList = [], isLoading: isOrdersLoading } =
    useGetOrdersByBuyerQuery(selectedBuyer?.buyerCode ?? 0, {
      skip: !selectedBuyer,
    });

  const { data: globalTypesList = [], isLoading: isTypesLoading } =
    useGetAllGarmentTypesQuery();

  const { data: stylesList = [], isLoading: isStylesLoading } =
    useGetStylesByScopeQuery(
      {
        buyerCode: selectedBuyer?.buyerCode ?? 0,
        order: selectedOrder ?? "",
        typeCode: selectedType?.id ?? 0,
      },
      { skip: !selectedBuyer || !selectedOrder || !selectedType },
    );

  // --- CASCADING STATE ROUTING MANIPULATION ACTIONS ---

  const handleBuyerChange = (buyerObj: Buyer | null) => {
    setSelectedBuyer(buyerObj);
    setSelectedOrder(null);
    setSelectedType(null);
    setSelectedStyle(null);
    onContextLock(null); // Clear down-stream panel tracking matrix lines instantly
  };

  const handleOrderChange = (orderCode: string | null) => {
    setSelectedOrder(orderCode);
    setSelectedType(null);
    setSelectedStyle(null);
    onContextLock(null);
  };

  const handleTypeChange = (typeObj: GarmentTypeServiceModel | null) => {
    setSelectedType(typeObj);
    setSelectedStyle(null);
    onContextLock(null);
  };

  const handleStyleChange = (styleObj: Style | null) => {
    setSelectedStyle(styleObj);

    // Broadcast parameters only when every layer is fully verified
    if (selectedBuyer && selectedOrder && selectedType && styleObj) {
      onContextLock({
        buyerCode: selectedBuyer.buyerCode,
        order: selectedOrder,
        typeCode: selectedType.id,
        styleCode: styleObj.styleCode || styleObj.styleCode,
      });
    } else {
      onContextLock(null);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2.5,
        mb: 3,
        backgroundColor: "#fafafa",
        borderLeft: "5px solid #1a237e",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: "block",
          fontWeight: "bold",
          color: "text.secondary",
          mb: 2,
          textTransform: "uppercase",
        }}
      >
        Style-Wise Events Selection Criteria Context Panel
      </Typography>

      {/* MUI v6 4-Column Responsive Layout Grid Sizing */}
      <Grid container spacing={2}>
        {/* Dropdown 1: Target Corporate Buyer */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={buyersList}
            getOptionLabel={(o: Buyer) => o.name || ""}
            value={selectedBuyer}
            onChange={(_, v: Buyer | null) => handleBuyerChange(v)}
            loading={isBuyersLoading}
            isOptionEqualToValue={(o, v) => o.buyerCode === v?.buyerCode}
            renderInput={(p) => (
              <TextField {...p} label="Select Buyer" size="small" />
            )}
          />
        </Grid>

        {/* Dropdown 2: Active Purchase Order Contract */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={ordersList}
            getOptionLabel={(o: string) => o || ""}
            disabled={!selectedBuyer}
            value={selectedOrder}
            onChange={(_, v: string | null) => handleOrderChange(v)}
            loading={isOrdersLoading}
            isOptionEqualToValue={(o, v) => o === v}
            renderInput={(p) => (
              <TextField {...p} label="Select Purchase Order" size="small" />
            )}
          />
        </Grid>

        {/* Dropdown 3: Garment Type Classification */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={globalTypesList}
            getOptionLabel={(o: GarmentTypeServiceModel) => o.typeName || ""}
            disabled={!selectedOrder}
            value={selectedType}
            onChange={(_, v: GarmentTypeServiceModel | null) =>
              handleTypeChange(v)
            }
            loading={isTypesLoading}
            isOptionEqualToValue={(o, v) => o.id === v?.id}
            renderInput={(p) => (
              <TextField {...p} label="Select Garment Type" size="small" />
            )}
          />
        </Grid>

        {/* Dropdown 4: Target Active Style Profile */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={stylesList}
            disabled={!selectedType}
            getOptionLabel={(o: Style) =>
              o.styleCode ? `${o.styleCode} (${Number(o.quantity) || 0})` : ""
            }
            value={selectedStyle}
            onChange={(_, v: Style | null) => handleStyleChange(v)}
            loading={isStylesLoading}
            isOptionEqualToValue={(o, v) => o.id === v?.id}
            renderInput={(p) => (
              <TextField {...p} label="Select Active Style" size="small" />
            )}
          />
        </Grid>
      </Grid>
    </Card>
  );
}
