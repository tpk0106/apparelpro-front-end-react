import type { ComponentProps } from "react";
import { Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

type GridSize = ComponentProps<typeof Grid>["size"];

interface KpiTileProps {
  label: string;
  value: string | number | undefined;
  loading: boolean;
  // Value line color override (e.g. the status colors on the Stock Movement
  // reports' KPI row). Defaults to the theme's near-white body text.
  color?: string;
  // Grid column sizing for this tile — each screen's KPI row has a different
  // column count, so this is left to the caller rather than hardcoded here.
  size?: GridSize;
}

const DEFAULT_SIZE: GridSize = { xs: 12, sm: 6, md: 3 };

// Shared stat-card used across report workspaces (Stock Movement Report, Stock
// Movement Item Report, STRN Print Report, ...). Previously duplicated
// independently in each of those three files as KpiTile/InfoTile — consolidated
// here after the same "invisible text" bug had to be fixed three separate times.
//
// IMPORTANT: this Paper has no background override, so it inherits the dark
// theme's background.paper (#141922). color="text.secondary" / the default
// "inherit" both silently resolve to a near-invisible color against that
// background instead of the theme's actual secondary/body color — both
// Typography colors below are hardcoded hex rather than trusted theme tokens.
export default function KpiTile({ label, value, loading, color, size }: KpiTileProps) {
  return (
    <Grid size={size ?? DEFAULT_SIZE}>
      <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
        <Typography
          variant="caption"
          sx={{ textTransform: "uppercase", color: "#8B93A1" }}
        >
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: color ?? "#F4F6F8" }}>
          {loading ? "…" : (value ?? "—")}
        </Typography>
      </Paper>
    </Grid>
  );
}
