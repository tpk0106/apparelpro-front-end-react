import { Button, Card, TextField, Typography } from "@mui/material";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  dateIconFieldSx,
} from "../../../themes/workspace-theme";

interface DateRangeFilterCardProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onDownloadPdf: () => void;
  downloadDisabled: boolean;
  isDownloading: boolean;
  captionText?: string;
}

export const DateRangeFilterCard = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onDownloadPdf,
  downloadDisabled,
  isDownloading,
  captionText,
}: DateRangeFilterCardProps) => (
  <Card variant="outlined" sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", gap: 2, backgroundColor: DASHBOARD_COLORS.cardBg, borderColor: DASHBOARD_COLORS.border }}>
    <TextField
      label="Start Date" type="date" size="small"
      slotProps={{ inputLabel: { shrink: true } }}
      value={startDate} onChange={(e) => onStartDateChange(e.target.value)}
      sx={dateIconFieldSx}
    />
    <TextField
      label="End Date" type="date" size="small"
      slotProps={{ inputLabel: { shrink: true } }}
      value={endDate} onChange={(e) => onEndDateChange(e.target.value)}
      sx={dateIconFieldSx}
    />
    <Button variant="contained" disabled={downloadDisabled} onClick={onDownloadPdf} sx={primaryActionButtonSx}>
      <span style={themedButtonLabelStyle}>{isDownloading ? "Preparing PDF..." : "Print / Download PDF"}</span>
    </Button>
    {captionText && (
      <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary }}>
        {captionText}
      </Typography>
    )}
  </Card>
);
