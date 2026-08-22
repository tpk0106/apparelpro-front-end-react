import { Box, Typography } from "@mui/material";
import type { ProductionLineAllocation } from "../../interfaces/production/ProductionLineAllocation";
import { DASHBOARD_COLORS } from "./dashboard-theme";

interface Props {
  lineAllocations: ProductionLineAllocation[];
}

const LineSchedule = ({ lineAllocations }: Props) => {
  if (lineAllocations.length === 0) {
    return <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>No line allocated for this style yet.</Typography>;
  }

  const starts = lineAllocations.map((a) => new Date(a.estimatedStartDate).getTime());
  const ends = lineAllocations.map((a) => new Date(a.estimatedEndDate).getTime());
  const windowStart = Math.min(...starts);
  const windowEnd = Math.max(...ends);
  const span = Math.max(windowEnd - windowStart, 1);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {lineAllocations.map((allocation) => {
        const start = new Date(allocation.estimatedStartDate).getTime();
        const end = new Date(allocation.estimatedEndDate).getTime();
        const leftPct = ((start - windowStart) / span) * 100;
        const widthPct = Math.max(((end - start) / span) * 100, 4);

        return (
          <Box
            key={`${allocation.lineCode}-${allocation.shipmentOrder}`}
            sx={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 1.5, alignItems: "center" }}
          >
            <Typography variant="body2" sx={{ fontFamily: "monospace", color: DASHBOARD_COLORS.textPrimary }}>
              {allocation.lineCode}
            </Typography>
            <Box sx={{ position: "relative", height: 24, borderRadius: 1, bgcolor: DASHBOARD_COLORS.border }}>
              <Box
                sx={{
                  position: "absolute",
                  top: 2,
                  bottom: 2,
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  borderRadius: 1,
                  bgcolor: allocation.isCritical ? DASHBOARD_COLORS.critical : DASHBOARD_COLORS.success,
                  display: "flex",
                  alignItems: "center",
                  px: 1,
                  overflow: "hidden",
                }}
              >
                <Typography variant="caption" sx={{ color: "#fff", whiteSpace: "nowrap" }}>
                  {allocation.estimatedStartDate} &rarr; {allocation.estimatedEndDate}
                  {allocation.isCritical ? " (slipped)" : ""}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default LineSchedule;
