import { Button, Card, TextField, Typography } from "@mui/material";

export const dateFieldSx = {
  "& .MuiOutlinedInput-input": { color: "#F4F6F8" },
  "& input::-webkit-calendar-picker-indicator": { filter: "invert(1)" },
};

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
  <Card variant="outlined" sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
    <TextField
      label="Start Date" type="date" size="small"
      slotProps={{ inputLabel: { shrink: true } }}
      value={startDate} onChange={(e) => onStartDateChange(e.target.value)}
      sx={dateFieldSx}
    />
    <TextField
      label="End Date" type="date" size="small"
      slotProps={{ inputLabel: { shrink: true } }}
      value={endDate} onChange={(e) => onEndDateChange(e.target.value)}
      sx={dateFieldSx}
    />
    <Button variant="contained" disabled={downloadDisabled} onClick={onDownloadPdf}>
      {isDownloading ? "Preparing PDF..." : "Print / Download PDF"}
    </Button>
    {captionText && (
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {captionText}
      </Typography>
    )}
  </Card>
);
