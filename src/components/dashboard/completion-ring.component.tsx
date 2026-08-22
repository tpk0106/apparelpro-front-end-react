import { Box, Typography } from "@mui/material";
import type { SectionProgress } from "../../interfaces/dashboard/Dashboard";
import { DASHBOARD_COLORS } from "./dashboard-theme";

interface Props {
  sections: SectionProgress[];
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CompletionRing = ({ sections }: Props) => {
  if (sections.length === 0) return null;
  const last = sections[sections.length - 1];
  const pct = last.ceilingQuantity > 0
    ? Math.min(100, (last.toDateQuantity / last.ceilingQuantity) * 100)
    : 0;
  const offset = CIRCUMFERENCE * (1 - pct / 100);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 1 }}>
      <svg width={132} height={132} viewBox="0 0 132 132">
        <circle cx={66} cy={66} r={RADIUS} fill="none" stroke={DASHBOARD_COLORS.border} strokeWidth={12} />
        <circle
          cx={66} cy={66} r={RADIUS} fill="none" stroke={DASHBOARD_COLORS.accentStrong} strokeWidth={12}
          strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
          transform="rotate(-90 66 66)"
        />
        <text x={66} y={62} textAnchor="middle" fontSize={22} fontWeight={600} fill={DASHBOARD_COLORS.textPrimary}>{pct.toFixed(0)}%</text>
        <text x={66} y={78} textAnchor="middle" fontSize={9} fill={DASHBOARD_COLORS.textSecondary}>
          {last.toDateQuantity.toLocaleString()} / {last.ceilingQuantity.toLocaleString()}
        </text>
      </svg>
      <Typography variant="body2" sx={{ mt: 1, color: DASHBOARD_COLORS.textPrimary }}>Through to {last.sectionDescription}</Typography>
    </Box>
  );
};

export default CompletionRing;
