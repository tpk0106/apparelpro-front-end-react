import { Box, Typography } from "@mui/material";
import type { ColorSizeMix } from "../../interfaces/dashboard/Dashboard";
import { DASHBOARD_COLORS } from "./dashboard-theme";

interface Props {
  mix: ColorSizeMix[];
}

const ColorSizeMixBars = ({ mix }: Props) => {
  if (mix.length === 0) {
    return <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>No color/size breakdown entered for this style.</Typography>;
  }

  const max = Math.max(...mix.map((m) => m.quantity), 1);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {mix.map((m) => (
        <Box key={`${m.color}-${m.size}`} sx={{ display: "grid", gridTemplateColumns: "90px 1fr 60px", gap: 1, alignItems: "center" }}>
          <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary }}>{m.color} / {m.size}</Typography>
          <Box sx={{ position: "relative", height: 12, borderRadius: 1, bgcolor: DASHBOARD_COLORS.border }}>
            <Box sx={{ position: "absolute", inset: 0, width: `${((m.quantity / max) * 100).toFixed(0)}%`, borderRadius: 1, bgcolor: DASHBOARD_COLORS.accent }} />
          </Box>
          <Typography variant="caption" sx={{ textAlign: "right", fontFamily: "monospace", color: DASHBOARD_COLORS.textPrimary }}>
            {m.quantity.toLocaleString()}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default ColorSizeMixBars;
