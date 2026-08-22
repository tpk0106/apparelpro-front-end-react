import { Box, Typography } from "@mui/material";
import type { StockItemMovement } from "../../interfaces/dashboard/Dashboard";
import { DASHBOARD_COLORS } from "./dashboard-theme";

interface Props {
  items: StockItemMovement[];
}

const StockAlerts = ({ items }: Props) => {
  const lowItems = items.filter((i) => i.isLow);

  if (lowItems.length === 0) {
    return <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>No items are trending toward a shortfall.</Typography>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      {lowItems.map((item) => {
        const pctIssued = item.receivedQuantity > 0 ? (item.issuedQuantity / item.receivedQuantity) * 100 : 0;
        return (
          <Box key={item.itemCode} sx={{ display: "flex", gap: 1.25 }}>
            <Box sx={{ width: 3, borderRadius: 1, bgcolor: pctIssued >= 100 ? DASHBOARD_COLORS.critical : DASHBOARD_COLORS.warning }} />
            <Box>
              <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary }}>
                {item.description || item.itemCode} {pctIssued >= 100 ? "out of stock" : "running low"}
              </Typography>
              <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary }}>
                {item.balanceQuantity.toLocaleString()} {item.unit} left &middot; {pctIssued.toFixed(0)}% of receipts issued
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default StockAlerts;
