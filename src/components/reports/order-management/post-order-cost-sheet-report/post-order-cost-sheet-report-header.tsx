import { useState, useMemo } from "react";
import { Button, Card, TextField, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";

import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
} from "../../../../tanstack-hooks/custom-hooks";

import type { PostOrderCostSheetReportScopeContext } from "./post-order-cost-sheet-report.types";
import type { Buyer } from "../../../../interfaces/references/Buyer";

interface PostOrderCostSheetReportHeaderProps {
  onScopeLock: (scope: PostOrderCostSheetReportScopeContext | null) => void;
}

// Buyer and Order are BOTH mandatory (OD_PCOST.PRG exits the screen if either is left
// empty) - same "scope lock" pattern as Cost of Production Report. Percent Of Total
// Value, Freight Charges and Actual Shipped Date mirror legacy's own print-time prompts -
// they default to 0/blank and only take effect once "Generate Report" is pressed.
export default function PostOrderCostSheetReportHeader({
  onScopeLock,
}: PostOrderCostSheetReportHeaderProps) {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [percentOfTotalValue, setPercentOfTotalValue] = useState<string>("0");
  const [freightCharges, setFreightCharges] = useState<string>("0");
  const [actualShippedDate, setActualShippedDate] = useState<string>("");

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
    onScopeLock(null);
  };

  const handleGenerate = () => {
    if (!selectedBuyer || !selectedOrder) return;
    onScopeLock({
      buyerCode: selectedBuyer.buyerCode,
      order: selectedOrder,
      percentOfTotalValue: Number(percentOfTotalValue) || 0,
      freightCharges: Number(freightCharges) || 0,
      actualShippedDate: actualShippedDate || null,
    });
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
        Post Order Cost Sheet - Selection Criteria
      </Typography>

      <Grid container spacing={2} sx={{ alignItems: "center" }}>
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
              <TextField {...p} label="Select Order" size="small" />
            )}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <TextField
            label="% Of Total Value"
            size="small"
            fullWidth
            type="number"
            value={percentOfTotalValue}
            onChange={(e) => setPercentOfTotalValue(e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <TextField
            label="Freight Charges"
            size="small"
            fullWidth
            type="number"
            value={freightCharges}
            onChange={(e) => setFreightCharges(e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <TextField
            label="Actual Shipped Date"
            size="small"
            fullWidth
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
            value={actualShippedDate}
            onChange={(e) => setActualShippedDate(e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 12 }}>
          <Button
            variant="contained"
            disabled={!selectedBuyer || !selectedOrder}
            onClick={handleGenerate}
          >
            Generate Report
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
}
