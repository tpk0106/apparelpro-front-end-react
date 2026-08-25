import { useState } from "react";
import { Button, Card, MenuItem, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

import type { MonthlyActualShipmentsReportScopeContext } from "./monthly-actual-shipments-report.types";

interface MonthlyActualShipmentsReportHeaderProps {
  onScopeLock: (scope: MonthlyActualShipmentsReportScopeContext | null) => void;
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const now = new Date();
const YEARS = Array.from({ length: 8 }, (_, i) => now.getFullYear() - i);

// Month and Year are BOTH mandatory (OD_ACTSP.PRG exits the screen if the Month/Year
// prompt is left blank) - same "scope lock" pattern as Cost of Production / Post Order
// Cost Sheet.
export default function MonthlyActualShipmentsReportHeader({
  onScopeLock,
}: MonthlyActualShipmentsReportHeaderProps) {
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());

  const handleGenerate = () => {
    onScopeLock({ month, year });
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
        Monthly Actual Shipments - Selection Criteria
      </Typography>

      <Grid container spacing={2} sx={{ alignItems: "center" }}>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <TextField
            select
            label="Month"
            size="small"
            fullWidth
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <TextField
            select
            label="Year"
            size="small"
            fullWidth
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {YEARS.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          <Button variant="contained" onClick={handleGenerate}>
            Generate Report
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
}
