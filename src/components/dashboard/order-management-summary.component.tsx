import { Box, Typography } from "@mui/material";
import type { OrderManagementSummary } from "../../interfaces/dashboard/Dashboard";
import { DASHBOARD_COLORS, ROW_ALT_BG } from "./dashboard-theme";

interface Props {
  summary: OrderManagementSummary;
}

// Deliberately plain Box rows, not MUI Table/TableRow/TableCell - the app's
// global theme forces MuiTableRow to hardcoded blue zebra stripes with
// !important (built for Material React Table grids elsewhere), which no
// component-level sx override can beat. Every other list on this dashboard
// already avoids that trap the same way.
const specRow = (label: string, value: string, index: number) => (
  <Box
    key={label}
    sx={{
      display: "flex",
      justifyContent: "space-between",
      gap: 2,
      px: 1.25,
      py: 0.9,
      backgroundColor: index % 2 === 1 ? ROW_ALT_BG : "transparent",
    }}
  >
    <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textSecondary }}>{label}</Typography>
    <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary, fontFamily: "monospace" }}>
      {value}
    </Typography>
  </Box>
);

const OrderManagementSummaryCard = ({ summary }: Props) => {
  const rows: [string, string][] = [
    ["Buyer", String(summary.buyerCode)],
    ["Order", summary.order],
    ["Garment type", String(summary.typeCode)],
    ["Style", summary.styleCode],
    ["Order quantity", summary.orderQuantity !== null
      ? `${summary.orderQuantity.toLocaleString()} ${summary.unit ?? ""}`.trim()
      : "-"],
    ["Unit price", summary.unitPrice !== null ? summary.unitPrice.toFixed(2) : "-"],
    ["Order date", summary.orderDate],
    ["Est. approval", summary.estimateApprovalDate ?? "-"],
  ];

  return (
    <Box sx={{ border: `1px solid ${DASHBOARD_COLORS.border}`, borderRadius: 1, overflow: "hidden" }}>
      {rows.map(([label, value], index) => specRow(label, value, index))}
    </Box>
  );
};

export default OrderManagementSummaryCard;
