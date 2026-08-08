import { useState, useMemo } from "react";
import { Card, TextField, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";

import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
} from "../../../../tanstack-hooks/custom-hooks";

import type { ColorSizeReportScopeContext } from "./color-size-report.types";
import type { Buyer } from "../../../../interfaces/references/Buyer";

interface ColorSizeReportHeaderProps {
  onScopeLock: (scope: ColorSizeReportScopeContext | null) => void;
}

// Two-level Buyer -> Purchase Order selector, same shape as Order Detail Report's
// header - this report is also scoped to "every Style/Colour under a Buyer+Order",
// not a single style.
export default function ColorSizeReportHeader({
  onScopeLock,
}: ColorSizeReportHeaderProps) {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const { data: buyerPageData, isLoading: isBuyersLoading } =
    useGetBuyersQuery({
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
    useGetAllPurchaseOrdersByBuyerCode(
      selectedBuyer?.buyerCode ?? 0,
      !!selectedBuyer,
    );

  const handleBuyerChange = (buyerObj: Buyer | null) => {
    setSelectedBuyer(buyerObj);
    setSelectedOrder(null);
    onScopeLock(null);
  };

  const handleOrderChange = (orderCode: string | null) => {
    setSelectedOrder(orderCode);

    if (selectedBuyer && orderCode) {
      onScopeLock({
        buyerCode: selectedBuyer.buyerCode,
        order: orderCode,
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
        Colour/Size Report - Selection Criteria
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
      </Grid>
    </Card>
  );
}
