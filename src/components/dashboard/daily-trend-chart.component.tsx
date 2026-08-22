import { useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import type { DailyTrendSeries } from "../../interfaces/dashboard/Dashboard";
import { DASHBOARD_COLORS, SECTION_COLORS } from "./dashboard-theme";

interface Props {
  series: DailyTrendSeries[];
}

const WIDTH = 720;
const HEIGHT = 320;
const PAD_LEFT = 52;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 36;
const GRID_LINES = 4;

const formatDate = (d: string) => {
  const parts = d.split("-");
  return parts.length === 3 ? `${parts[1]}/${parts[2]}` : d;
};

const DailyTrendChart = ({ series }: Props) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const dates = series[0]?.points.map((p) => p.date) ?? [];
  const n = dates.length;

  if (n === 0) {
    return <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>No entries yet for this style.</Typography>;
  }

  const allValues = series.flatMap((s) => s.points.map((p) => p.quantity));
  const maxValue = Math.max(...allValues, 1);
  const yMax = Math.max(Math.ceil((maxValue * 1.15) / GRID_LINES) * GRID_LINES, GRID_LINES);

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const xScale = (i: number) => PAD_LEFT + (n > 1 ? (i * plotWidth) / (n - 1) : plotWidth / 2);
  const yScale = (v: number) => PAD_TOP + plotHeight - (v / yMax) * plotHeight;

  const gridValues = Array.from({ length: GRID_LINES + 1 }, (_, i) => Math.round((yMax / GRID_LINES) * i));
  const dateLabelStep = Math.max(1, Math.ceil(n / 10));

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const clamped = Math.max(PAD_LEFT, Math.min(WIDTH - PAD_RIGHT, relX));
    const ratio = n > 1 ? (clamped - PAD_LEFT) / plotWidth : 0;
    const idx = Math.round(ratio * (n - 1));
    setHoverIndex(Math.max(0, Math.min(n - 1, idx)));
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, color: DASHBOARD_COLORS.textPrimary }}>
        Daily quantity by section
      </Typography>
      <Box sx={{ position: "relative" }}>
        <svg
          ref={svgRef}
          width="100%"
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
          style={{ display: "block" }}
        >
          {gridValues.map((v) => (
            <g key={v}>
              <line
                x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={yScale(v)} y2={yScale(v)}
                stroke={DASHBOARD_COLORS.border} strokeWidth={1}
              />
              <text x={PAD_LEFT - 8} y={yScale(v) + 4} textAnchor="end" fontSize={11} fill={DASHBOARD_COLORS.textSecondary}>
                {v.toLocaleString()}
              </text>
            </g>
          ))}

          {dates.map((d, i) => (
            i % dateLabelStep === 0 && (
              <text
                key={d} x={xScale(i)} y={HEIGHT - PAD_BOTTOM + 18} textAnchor="middle"
                fontSize={11} fill={DASHBOARD_COLORS.textSecondary}
              >
                {formatDate(d)}
              </text>
            )
          ))}

          {hoverIndex !== null && (
            <line
              x1={xScale(hoverIndex)} x2={xScale(hoverIndex)} y1={PAD_TOP} y2={HEIGHT - PAD_BOTTOM}
              stroke={DASHBOARD_COLORS.borderStrong} strokeWidth={1} strokeDasharray="3,3"
            />
          )}

          {series.map((s, si) => {
            const color = SECTION_COLORS[si % SECTION_COLORS.length];
            const points = s.points.map((p, i) => `${xScale(i)},${yScale(p.quantity)}`).join(" ");
            return (
              <g key={s.sectionCode}>
                <polyline points={points} fill="none" stroke={color} strokeWidth={2.5} />
                {s.points.map((p, i) => (
                  <circle key={i} cx={xScale(i)} cy={yScale(p.quantity)} r={hoverIndex === i ? 5 : 3} fill={color} />
                ))}
              </g>
            );
          })}
        </svg>

        {hoverIndex !== null && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: `${Math.min(72, (xScale(hoverIndex) / WIDTH) * 100)}%`,
              bgcolor: DASHBOARD_COLORS.cardBg,
              border: `1px solid ${DASHBOARD_COLORS.borderStrong}`,
              borderRadius: 1,
              p: 1,
              minWidth: 150,
              pointerEvents: "none",
              boxShadow: "0 6px 16px rgba(0,0,0,0.5)",
            }}
          >
            <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textPrimary, fontWeight: 600, display: "block", mb: 0.5 }}>
              {dates[hoverIndex]}
            </Typography>
            {series.map((s, si) => (
              <Box key={s.sectionCode} sx={{ display: "flex", justifyContent: "space-between", gap: 1.5 }}>
                <Typography
                  variant="caption"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5, color: DASHBOARD_COLORS.textSecondary }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 7, height: 7, borderRadius: "2px",
                      bgcolor: SECTION_COLORS[si % SECTION_COLORS.length], display: "inline-block",
                    }}
                  />
                  {s.sectionDescription}
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: "monospace", color: DASHBOARD_COLORS.textPrimary }}>
                  {(s.points[hoverIndex]?.quantity ?? 0).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
        {series.map((s, si) => (
          <Typography
            key={s.sectionCode}
            variant="caption"
            sx={{ display: "flex", alignItems: "center", gap: 0.5, color: DASHBOARD_COLORS.textSecondary }}
          >
            <Box
              component="span"
              sx={{
                width: 8, height: 8, borderRadius: "2px",
                bgcolor: SECTION_COLORS[si % SECTION_COLORS.length], display: "inline-block",
              }}
            />
            {s.sectionDescription}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default DailyTrendChart;
