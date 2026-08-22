import { useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import type { ProductionProgressPoint } from "../../../interfaces/production/ProductionProgressReport";

interface Props {
  estimatedSeries: ProductionProgressPoint[];
  actualSeries: ProductionProgressPoint[];
}

const COLORS = {
  text: "#F4F6F8",
  textSecondary: "#B7BEC7",
  grid: "rgba(244,246,248,0.14)",
  estimated: "#93A83C",
  actual: "#60a5fa",
  tooltipBg: "#1E2530",
  tooltipBorder: "rgba(244,246,248,0.25)",
};

const WIDTH = 900;
const HEIGHT = 340;
const PAD_LEFT = 56;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 32;
const GRID_LINES = 5;

const ProductionProgressChart = ({ estimatedSeries, actualSeries }: Props) => {
  const [hoverDay, setHoverDay] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const maxDay = Math.max(
    estimatedSeries.length ? estimatedSeries[estimatedSeries.length - 1].dayNumber : 0,
    actualSeries.length ? actualSeries[actualSeries.length - 1].dayNumber : 0,
    1,
  );

  if (estimatedSeries.length === 0 && actualSeries.length === 0) {
    return <Typography sx={{ color: COLORS.textSecondary }}>No production data yet for this style.</Typography>;
  }

  const maxValue = Math.max(
    ...estimatedSeries.map((p) => p.cumulativeQuantity),
    ...actualSeries.map((p) => p.cumulativeQuantity),
    1,
  );
  const yMax = Math.max(Math.ceil((maxValue * 1.1) / GRID_LINES) * GRID_LINES, GRID_LINES);

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const xScale = (day: number) => PAD_LEFT + (maxDay > 1 ? ((day - 1) * plotWidth) / (maxDay - 1) : plotWidth / 2);
  const yScale = (v: number) => PAD_TOP + plotHeight - (v / yMax) * plotHeight;

  const gridValues = Array.from({ length: GRID_LINES + 1 }, (_, i) => Math.round((yMax / GRID_LINES) * i));
  const dayLabelStep = Math.max(1, Math.ceil(maxDay / 15));

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const clamped = Math.max(PAD_LEFT, Math.min(WIDTH - PAD_RIGHT, relX));
    const ratio = maxDay > 1 ? (clamped - PAD_LEFT) / plotWidth : 0;
    const day = Math.round(ratio * (maxDay - 1)) + 1;
    setHoverDay(Math.max(1, Math.min(maxDay, day)));
  };

  const estimatedAtHover = hoverDay !== null ? estimatedSeries.find((p) => p.dayNumber === hoverDay) : undefined;
  const actualAtHover = hoverDay !== null ? actualSeries.find((p) => p.dayNumber === hoverDay) : undefined;

  const toPolyline = (series: ProductionProgressPoint[]) =>
    series.map((p) => `${xScale(p.dayNumber)},${yScale(p.cumulativeQuantity)}`).join(" ");

  return (
    <Box>
      <Box sx={{ position: "relative" }}>
        <svg
          ref={svgRef}
          width="100%"
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverDay(null)}
          style={{ display: "block" }}
        >
          {gridValues.map((v) => (
            <g key={v}>
              <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={yScale(v)} y2={yScale(v)} stroke={COLORS.grid} strokeWidth={1} />
              <text x={PAD_LEFT - 8} y={yScale(v) + 4} textAnchor="end" fontSize={11} fill={COLORS.textSecondary}>
                {v.toLocaleString()}
              </text>
            </g>
          ))}

          {Array.from({ length: maxDay }, (_, i) => i + 1).map((day) =>
            (day - 1) % dayLabelStep === 0 ? (
              <text key={day} x={xScale(day)} y={HEIGHT - PAD_BOTTOM + 16} textAnchor="middle" fontSize={10} fill={COLORS.textSecondary}>
                {day}
              </text>
            ) : null,
          )}

          {hoverDay !== null && (
            <line
              x1={xScale(hoverDay)} x2={xScale(hoverDay)} y1={PAD_TOP} y2={HEIGHT - PAD_BOTTOM}
              stroke={COLORS.tooltipBorder} strokeWidth={1} strokeDasharray="3,3"
            />
          )}

          <polyline points={toPolyline(estimatedSeries)} fill="none" stroke={COLORS.estimated} strokeWidth={2} strokeDasharray="6,4" />
          <polyline points={toPolyline(actualSeries)} fill="none" stroke={COLORS.actual} strokeWidth={2.5} />

          {estimatedSeries.map((p) => (
            <circle key={`e-${p.dayNumber}`} cx={xScale(p.dayNumber)} cy={yScale(p.cumulativeQuantity)} r={hoverDay === p.dayNumber ? 4 : 2} fill={COLORS.estimated} />
          ))}
          {actualSeries.map((p) => (
            <circle key={`a-${p.dayNumber}`} cx={xScale(p.dayNumber)} cy={yScale(p.cumulativeQuantity)} r={hoverDay === p.dayNumber ? 4 : 2} fill={COLORS.actual} />
          ))}
        </svg>

        {hoverDay !== null && (estimatedAtHover || actualAtHover) && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: `${Math.min(78, (xScale(hoverDay) / WIDTH) * 100)}%`,
              bgcolor: COLORS.tooltipBg,
              border: `1px solid ${COLORS.tooltipBorder}`,
              borderRadius: 1,
              p: 1,
              minWidth: 150,
              pointerEvents: "none",
              boxShadow: "0 6px 16px rgba(0,0,0,0.5)",
            }}
          >
            <Typography variant="caption" sx={{ color: COLORS.text, fontWeight: 600, display: "block", mb: 0.5 }}>
              Day {hoverDay}
            </Typography>
            {estimatedAtHover && (
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5 }}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>Estimated</Typography>
                <Typography variant="caption" sx={{ fontFamily: "monospace", color: COLORS.text }}>
                  {estimatedAtHover.cumulativeQuantity.toLocaleString()}
                </Typography>
              </Box>
            )}
            {actualAtHover && (
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5 }}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>Actual</Typography>
                <Typography variant="caption" sx={{ fontFamily: "monospace", color: COLORS.text }}>
                  {actualAtHover.cumulativeQuantity.toLocaleString()}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
        <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: COLORS.textSecondary }}>
          <Box component="span" sx={{ width: 12, height: 0, borderTop: `2px dashed ${COLORS.estimated}`, display: "inline-block" }} />
          Estimated
        </Typography>
        <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: COLORS.textSecondary }}>
          <Box component="span" sx={{ width: 12, height: 0, borderTop: `2.5px solid ${COLORS.actual}`, display: "inline-block" }} />
          Actual
        </Typography>
      </Box>
    </Box>
  );
};

export default ProductionProgressChart;
