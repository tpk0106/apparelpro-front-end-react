import { Box, Typography } from "@mui/material";
import type { SectionProgress } from "../../interfaces/dashboard/Dashboard";
import { DASHBOARD_COLORS, SECTION_COLORS } from "./dashboard-theme";

interface Props {
  sections: SectionProgress[];
  contractSectionCode: string;
}

const SectionFunnel = ({ sections, contractSectionCode }: Props) => {
  return (
    <Box>
      {sections.map((section, index) => {
        const isContract = section.sectionCode === contractSectionCode;
        const pct = section.ceilingQuantity > 0
          ? Math.min(100, (section.toDateQuantity / section.ceilingQuantity) * 100)
          : 0;
        const color = SECTION_COLORS[index % SECTION_COLORS.length];
        return (
          <Box
            key={section.sectionCode}
            sx={{
              display: "grid",
              gridTemplateColumns: "110px 1fr 90px",
              gap: 1.5,
              alignItems: "center",
              py: 1,
              borderBottom: `1px solid ${DASHBOARD_COLORS.border}`,
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={500} sx={{ color: DASHBOARD_COLORS.textPrimary }}>{section.sectionDescription}</Typography>
              {isContract && <Typography variant="caption" color="text.secondary">Contract section</Typography>}
            </Box>
            <Box sx={{ position: "relative", height: 14, borderRadius: 1, bgcolor: DASHBOARD_COLORS.border }}>
              <Box sx={{ position: "absolute", inset: 0, width: `${pct.toFixed(0)}%`, borderRadius: 1, bgcolor: color }} />
            </Box>
            <Typography variant="body2" sx={{ textAlign: "right", fontFamily: "monospace", color: DASHBOARD_COLORS.textPrimary }}>
              {section.toDateQuantity.toLocaleString()}
              <Typography component="span" variant="caption" color="text.secondary" sx={{ display: "block" }}>
                {pct.toFixed(0)}%
              </Typography>
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default SectionFunnel;
