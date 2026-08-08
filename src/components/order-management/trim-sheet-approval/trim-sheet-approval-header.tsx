import { useState, useMemo } from "react";
import { Card, TextField, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";

import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
  useGetAllGarmentTypes,
  useGetStylesByScope,
} from "../../../tanstack-hooks/custom-hooks";

import type { Style } from "../../../interfaces/OrderManagement/Style";
import type { TrimSheetApprovalScopeContext } from "./trim-sheet-approval.types";
import type { GarmentTypeServiceModel } from "../../material-consumption/material-consumption.types";
import type { Buyer } from "../../../interfaces/references/Buyer";

interface TrimSheetApprovalHeaderProps {
  // Broadcasts the fully-resolved Buyer/Order/Type/Style scope up to the
  // workspace once every dropdown level has settled; null while incomplete.
  onScopeLock: (scope: TrimSheetApprovalScopeContext | null) => void;
}

export default function TrimSheetApprovalHeader({
  onScopeLock,
}: TrimSheetApprovalHeaderProps) {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedType, setSelectedType] =
    useState<GarmentTypeServiceModel | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);

  const { data: buyerPageData, isLoading: isBuyersLoading } = useGetBuyersQuery(
    {
      pageIndex: 0,
      pageSize: 999,
      sortColumn: "name",
      sortOrder: "asc",
      filterColumn: null,
      filterQuery: null,
    },
  );
  const buyersList = useMemo<Buyer[]>(
    () => buyerPageData?.items || [],
    [buyerPageData],
  );

  const { data: ordersList = [], isLoading: isOrdersLoading } =
    useGetAllPurchaseOrdersByBuyerCode(
      selectedBuyer?.buyerCode ?? 0,
      !!selectedBuyer,
    );

  const { data: globalTypesList = [], isLoading: isTypesLoading } =
    useGetAllGarmentTypes();

  const { data: stylesList = [], isLoading: isStylesLoading } =
    useGetStylesByScope(
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
    onScopeLock(null);
  };

  const handleOrderChange = (orderCode: string | null) => {
    setSelectedOrder(orderCode);
    setSelectedType(null);
    setSelectedStyle(null);
    onScopeLock(null);
  };

  const handleTypeChange = (typeObj: GarmentTypeServiceModel | null) => {
    setSelectedType(typeObj);
    setSelectedStyle(null);
    onScopeLock(null);
  };

  const handleStyleChange = (styleObj: Style | null) => {
    setSelectedStyle(styleObj);

    if (selectedBuyer && selectedOrder && selectedType && styleObj) {
      onScopeLock({
        buyerCode: selectedBuyer.buyerCode,
        order: selectedOrder,
        typeCode: selectedType.id,
        styleCode: styleObj.styleCode,
      });
    } else {
      onScopeLock(null);
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
        Approve Trim Sheet - Selection Criteria
      </Typography>

      <Grid container spacing={2}>
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
