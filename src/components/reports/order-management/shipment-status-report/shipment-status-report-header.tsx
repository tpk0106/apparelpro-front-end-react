import { useState, useMemo } from "react";
import { Card, TextField, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";

import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
} from "../../../../tanstack-hooks/custom-hooks";

import type { ShipmentStatusReportScopeContext } from "./shipment-status-report.types";
import type { Buyer } from "../../../../interfaces/references/Buyer";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../../../themes/useDropdownTheme";
import { workspaceInfoCaptionSx } from "../../../../themes/workspace-theme";

interface ShipmentStatusReportHeaderProps {
  // Broadcasts the fully-resolved Buyer+Order scope up to the workspace once both
  // levels have settled; null while incomplete (same "scope lock" pattern as Order
  // Detail Report - both fields are mandatory here too, per OD_SHPST.PRG).
  onScopeLock: (scope: ShipmentStatusReportScopeContext | null) => void;
}

export default function ShipmentStatusReportHeader({
  onScopeLock,
}: ShipmentStatusReportHeaderProps) {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

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
        backgroundColor: DASHBOARD_COLORS.cardBg,
        border: `1px solid ${DASHBOARD_COLORS.border}`,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          ...workspaceInfoCaptionSx,
          fontWeight: "bold",
          mb: 2,
          textTransform: "uppercase",
        }}
      >
        Shipment Status Report - Selection Criteria
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
            slotProps={{ listbox: { sx: dropdownListboxSx } }}
            renderInput={(p) => (
              <TextField {...p} label="Select Buyer" size="small" sx={dropdownFieldSx} />
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
            slotProps={{ listbox: { sx: dropdownListboxSx } }}
            renderInput={(p) => (
              <TextField {...p} label="Select Order" size="small" sx={dropdownFieldSx} />
            )}
          />
        </Grid>
      </Grid>
    </Card>
  );
}
