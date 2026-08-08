import { useMemo, useState } from "react";
import { Autocomplete, Button, Card, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

import { useGetBasis } from "../../../../tanstack-hooks/custom-hooks";
import type { Basis } from "../../../../interfaces/references/Basis";
import type { OutstandingPurchaseOrderListReportQueryParams } from "../../../../services/reports/order-management/outstanding-purchase-order-list-report.service";

interface OutstandingPurchaseOrderListReportHeaderProps {
  // Broadcasts the submitted Start Date/End Date/Basis criteria up to the workspace
  // once the user clicks "View Report"; null while nothing has been submitted yet.
  onScopeLock: (scope: OutstandingPurchaseOrderListReportQueryParams | null) => void;
}

// Date-range + optional Basis selector, unlike the Buyer -> Order or single-P/O-number
// selectors the other three reports use - this report is scoped to a Start/End Date
// range (required) with an optional exact-match Basis filter, matching OD_PLST1.PRG's
// own input screen. Uses a "View Report" submit button rather than auto-locking on
// every keystroke, since a date range isn't naturally complete until both ends and any
// Basis choice are settled.
export default function OutstandingPurchaseOrderListReportHeader({
  onScopeLock,
}: OutstandingPurchaseOrderListReportHeaderProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedBasis, setSelectedBasis] = useState<Basis | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data: basisPageData, isLoading: isBasisLoading } = useGetBasis({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "description",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const basisList = useMemo<Basis[]>(
    () => basisPageData?.items || [],
    [basisPageData],
  );

  const handleViewReport = () => {
    if (!startDate || !endDate) {
      setValidationError("Both Start Date and End Date are required.");
      return;
    }
    if (startDate > endDate) {
      setValidationError("Start Date cannot be after End Date.");
      return;
    }
    setValidationError(null);
    onScopeLock({
      startDate,
      endDate,
      basisCode: selectedBasis?.code ?? null,
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
        List of Outstanding P/O's - Selection Criteria
      </Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            type="date"
            label="Start Date"
            size="small"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            type="date"
            label="End Date"
            size="small"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={basisList}
            getOptionLabel={(o: Basis) => o.description || o.code || ""}
            value={selectedBasis}
            onChange={(_, v: Basis | null) => setSelectedBasis(v)}
            loading={isBasisLoading}
            isOptionEqualToValue={(o, v) => o.code === v?.code}
            renderInput={(p) => (
              <TextField {...p} label="Basis (optional)" size="small" />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Button variant="contained" fullWidth onClick={handleViewReport}>
            View Report
          </Button>
        </Grid>

        {validationError && (
          <Grid size={12}>
            <Typography variant="caption" color="error">
              {validationError}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Card>
  );
}
