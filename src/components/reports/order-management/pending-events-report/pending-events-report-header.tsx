import { useState } from "react";
import { Card, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

import type { PendingEventsReportScopeContext } from "./pending-events-report.types";
import { DASHBOARD_COLORS } from "../../../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../../../themes/useDropdownTheme";
import { dateIconFieldSx, workspaceInfoCaptionSx } from "../../../../themes/workspace-theme";

interface PendingEventsReportHeaderProps {
  onScopeChange: (scope: PendingEventsReportScopeContext) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

// As Of Date is mandatory (OD_EVPND.PRG exits the screen if left empty) - defaults to
// today, matching the legacy's own m_date = date() default.
export default function PendingEventsReportHeader({
  onScopeChange,
}: PendingEventsReportHeaderProps) {
  const { fieldSx: dropdownFieldSx } = useDropdownTheme();
  const [asOfDate, setAsOfDate] = useState(today());

  const handleDateChange = (value: string) => {
    setAsOfDate(value);
    if (value) {
      onScopeChange({ asOfDate: value });
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
        Pending Events - Selection Criteria
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            label="As Of Date"
            size="small"
            fullWidth
            type="date"
            value={asOfDate}
            onChange={(e) => handleDateChange(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ ...dropdownFieldSx, ...(dateIconFieldSx as Record<string, unknown>) }}
          />
        </Grid>
      </Grid>
    </Card>
  );
}
