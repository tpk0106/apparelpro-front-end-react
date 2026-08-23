import { useState, useMemo } from "react";
import { Card, TextField, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";

import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
} from "../../../../tanstack-hooks/custom-hooks";

import type { ScheduledShipmentsReportScopeContext } from "./scheduled-shipments-report.types";
import type { Buyer } from "../../../../interfaces/references/Buyer";

interface ScheduledShipmentsReportHeaderProps {
  onScopeChange: (scope: ScheduledShipmentsReportScopeContext) => void;
}

// Buyer and Order are BOTH optional here (unlike Colour/Size or Order Detail) - leaving
// both blank lists every scheduled shipment, matching OD_RSHP1.PRG's own "both empty"
// case. Order only makes sense once a Buyer is picked, so it stays disabled until then.
export default function ScheduledShipmentsReportHeader({
  onScopeChange,
}: ScheduledShipmentsReportHeaderProps) {
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
    onScopeChange({ buyerCode: buyerObj?.buyerCode ?? null, order: null });
  };

  const handleOrderChange = (orderCode: string | null) => {
    setSelectedOrder(orderCode);
    onScopeChange({ buyerCode: selectedBuyer?.buyerCode ?? null, order: orderCode });
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
        Scheduled Shipments Report - Selection Criteria (optional filters)
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
              <TextField {...p} label="Buyer (optional)" size="small" />
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
              <TextField {...p} label="Order (optional)" size="small" />
            )}
          />
        </Grid>
      </Grid>
    </Card>
  );
}
