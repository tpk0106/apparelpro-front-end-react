import { useState } from "react";
import { Card, TextField, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";

import { useGetPurchaseOrderNumbersQuery } from "../../../../tanstack-hooks/purchase-order-list-report.hooks";

interface PurchaseOrderListReportHeaderProps {
  // Broadcasts the selected Purchase Order No. up to the workspace once chosen;
  // null while nothing is selected.
  onScopeLock: (purchaseOrderNumber: string | null) => void;
}

// Single-level Purchase Order Number selector, backed by a dedicated lookup endpoint
// (a deliberate modernization of OD_POLST.PRG's masked free-text F1-help input) rather
// than a Buyer -> Order cascade - this report scopes to one Supplier Purchase Order
// number directly, not a Buyer sales Order.
export default function PurchaseOrderListReportHeader({
  onScopeLock,
}: PurchaseOrderListReportHeaderProps) {
  const [selectedPoNumber, setSelectedPoNumber] = useState<string | null>(
    null,
  );

  const { data: poNumbersList = [], isLoading: isPoNumbersLoading } =
    useGetPurchaseOrderNumbersQuery();

  const handlePoNumberChange = (poNumber: string | null) => {
    setSelectedPoNumber(poNumber);
    onScopeLock(poNumber);
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
        Purchase Order List Report - Selection Criteria
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Autocomplete
            options={poNumbersList}
            getOptionLabel={(o: string) => o || ""}
            value={selectedPoNumber}
            onChange={(_, v: string | null) => handlePoNumberChange(v)}
            loading={isPoNumbersLoading}
            isOptionEqualToValue={(o, v) => o === v}
            renderInput={(p) => (
              <TextField
                {...p}
                label="Select Purchase Order No."
                size="small"
              />
            )}
          />
        </Grid>
      </Grid>
    </Card>
  );
}
