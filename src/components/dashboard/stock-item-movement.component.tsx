import { Box, Typography } from "@mui/material";
import type { StockItemMovement } from "../../interfaces/dashboard/Dashboard";
import { DASHBOARD_COLORS } from "./dashboard-theme";

interface Props {
  items: StockItemMovement[];
}

const ISSUED_COLOR = "#e35a24";

const StockItemMovementBars = ({ items }: Props) => {
  if (items.length === 0) {
    return <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>No stock movement posted for this order yet.</Typography>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {items.map((item) => {
        const total = item.receivedQuantity + item.issuedQuantity + Math.max(item.balanceQuantity, 0);
        const receivedPct = total > 0 ? (item.receivedQuantity / total) * 100 : 0;
        const issuedPct = total > 0 ? (item.issuedQuantity / total) * 100 : 0;
        const balancePct = Math.max(100 - receivedPct - issuedPct, 0);

        return (
          <Box key={item.itemCode}>
            <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary, mb: 0.5 }}>{item.description || item.itemCode}</Typography>
            <Box sx={{ display: "flex", height: 14, borderRadius: 1, overflow: "hidden" }}>
              <Box sx={{ width: `${receivedPct.toFixed(1)}%`, bgcolor: DASHBOARD_COLORS.success }} />
              <Box sx={{ width: `${issuedPct.toFixed(1)}%`, bgcolor: ISSUED_COLOR }} />
              <Box sx={{ width: `${balancePct.toFixed(1)}%`, bgcolor: DASHBOARD_COLORS.border }} />
            </Box>
            <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
              <Typography variant="caption" sx={{ fontFamily: "monospace", color: DASHBOARD_COLORS.textSecondary }}>
                GRN {item.receivedQuantity.toLocaleString()} {item.unit}
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: "monospace", color: DASHBOARD_COLORS.textSecondary }}>
                Issued {item.issuedQuantity.toLocaleString()} {item.unit}
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: "monospace", color: DASHBOARD_COLORS.textSecondary }}>
                Bal {item.balanceQuantity.toLocaleString()} {item.unit}
              </Typography>
            </Box>
          </Box>
        );
      })}
      <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
        <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: DASHBOARD_COLORS.textSecondary }}>
          <Box component="span" sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: DASHBOARD_COLORS.success, display: "inline-block" }} />
          Received
        </Typography>
        <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: DASHBOARD_COLORS.textSecondary }}>
          <Box component="span" sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: ISSUED_COLOR, display: "inline-block" }} />
          Issued
        </Typography>
        <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: DASHBOARD_COLORS.textSecondary }}>
          <Box component="span" sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: DASHBOARD_COLORS.border, display: "inline-block" }} />
          Balance
        </Typography>
      </Box>
    </Box>
  );
};

export default StockItemMovementBars;
