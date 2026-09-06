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
// Fixed (not min-) height sized for the tallest realistic content: a 2-line-wrapped
// value (e.g. a long Buyer name, or "Currency / Basis") under a 1-line caption label,
// plus the Paper's own padding. Every tile gets exactly this height regardless of its
// own content's actual length, so a row of short values (Unit, Order No) lines up
// pixel-for-pixel with a row of long ones (Buyer, Currency / Basis) — `minHeight` alone
// doesn't do this, since the Paper never stretches to fill a taller sibling's Grid
// cell on its own; a hard `height` sidesteps that entirely.
//
// FIXED (previous value 76 was too short to actually fit 2 lines): caption label
// (~20px at default line-height) + two h6 lines (~32px each = 64px) + the Paper's own
// 1.75 * 8px = 14px padding on top AND bottom (28px total) needs ~112px, not 76 - at
// 76 the flexbox column had less room than the clamped value box needed, so the value
// rendered with ~0 visible height instead of just failing to center nicely.
const TILE_HEIGHT = 112;

export default function KpiTile({ label, value, loading, color, size }: KpiTileProps) {
  return (
    <Grid size={size ?? DEFAULT_SIZE}>
      <Paper
        variant="outlined"
        sx={{
          p: 1.75,
          borderRadius: 2,
          height: TILE_HEIGHT,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{ textTransform: "uppercase", color: "#8B93A1", flexShrink: 0 }}
        >
          {label}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: color ?? "#F4F6F8",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "break-word",
            flexShrink: 0,
          }}
        >
          {loading ? "…" : (value ?? "—")}
        </Typography>
      </Paper>
    </Grid>
  );
}
