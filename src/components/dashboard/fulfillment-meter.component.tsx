import { Box, Typography } from "@mui/material";
import type { OrderManagementSummary } from "../../interfaces/dashboard/Dashboard";
import { DASHBOARD_COLORS } from "./dashboard-theme";

interface Props {
  summary: OrderManagementSummary;
}

const FulfillmentMeter = ({ summary }: Props) => {
  const orderQuantity = summary.orderQuantity ?? 0;
  const pct = orderQuantity > 0
    ? Math.min(100, (summary.shippedQuantity / orderQuantity) * 100)
    : 0;

  return (
    <Box>
      <Box sx={{ position: "relative", height: 26, borderRadius: 1, bgcolor: DASHBOARD_COLORS.border, overflow: "hidden" }}>
        <Box sx={{ position: "absolute", inset: 0, width: `${pct.toFixed(0)}%`, bgcolor: DASHBOARD_COLORS.accent }} />
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", px: 1.25 }}>
          <Typography variant="caption" sx={{ color: "#fff", fontFamily: "monospace" }}>
            {summary.shippedQuantity.toLocaleString()} / {orderQuantity.toLocaleString()} {summary.unit ?? ""} &middot; {pct.toFixed(0)}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default FulfillmentMeter;
