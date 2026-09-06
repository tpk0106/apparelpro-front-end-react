import { useState } from "react";
import { Button, Card, MenuItem, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

import type { MonthlyActualShipmentsReportScopeContext } from "./monthly-actual-shipments-report.types";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../../../themes/useDropdownTheme";
import {
  numberFieldNoSpinnerSx,
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceInfoCaptionSx,
} from "../../../../themes/workspace-theme";

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

// Month and Year are BOTH mandatory (OD_ACTSP.PRG exits the screen if the Month/Year
// prompt is left blank) - same "scope lock" pattern as Cost of Production / Post Order
// Cost Sheet. Year is a free-typed number rather than a fixed dropdown list - shipment
// history isn't bounded to a handful of recent years.
export default function MonthlyActualShipmentsReportHeader({
  onScopeLock,
}: MonthlyActualShipmentsReportHeaderProps) {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const dropdownMenuSlotProps = { select: { MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } } };
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [yearInput, setYearInput] = useState<string>(String(now.getFullYear()));

  const year = Number(yearInput);
  const isYearValid = Number.isInteger(year) && year >= 1900 && year <= 2100;

  const handleGenerate = () => {
    if (!isYearValid) return;
    onScopeLock({ month, year });
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
            sx={dropdownFieldSx}
            slotProps={dropdownMenuSlotProps}
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
            label="Year"
            size="small"
            fullWidth
            type="number"
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
            error={yearInput !== "" && !isYearValid}
            slotProps={{ htmlInput: { min: 1900, max: 2100 } }}
            sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={!isYearValid}
            fullWidth
            sx={primaryActionButtonSx}
          >
            <span style={themedButtonLabelStyle}>Generate Report</span>
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
}
