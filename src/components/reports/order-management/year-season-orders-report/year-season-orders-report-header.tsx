import { useMemo, useState } from "react";
import { Card, TextField, Typography, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid";

import { useGetSeasons } from "../../../../tanstack-hooks/custom-hooks";
import type { YearSeasonOrdersReportScopeContext } from "./year-season-orders-report.types";

interface YearSeasonOrdersReportHeaderProps {
  onScopeChange: (scope: YearSeasonOrdersReportScopeContext) => void;
}

// Year and Season are BOTH optional (matching OD_RPO2.PRG's own "both empty" case,
// same as Scheduled Shipments Report) - leaving both blank lists every order.
export default function YearSeasonOrdersReportHeader({
  onScopeChange,
}: YearSeasonOrdersReportHeaderProps) {
  const [yearInput, setYearInput] = useState("");
  const [season, setSeason] = useState("");

  // Same shared Season reference lookup as the Order Confirmation Routine's Season
  // dropdown - see useGetSeasons in tanstack-hooks/custom-hooks.ts.
  const { data: seasonsPageData } = useGetSeasons({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "description",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const seasonOptions = useMemo(
    () => seasonsPageData?.items || [],
    [seasonsPageData?.items],
  );

  const handleYearChange = (value: string) => {
    setYearInput(value);
    const parsed = value.trim() === "" ? null : Number(value);
    onScopeChange({
      year: parsed && !Number.isNaN(parsed) ? parsed : null,
      season: season || null,
    });
  };

  const handleSeasonChange = (value: string) => {
    setSeason(value);
    const parsedYear = yearInput.trim() === "" ? null : Number(yearInput);
    onScopeChange({
      year: parsedYear && !Number.isNaN(parsedYear) ? parsedYear : null,
      season: value || null,
    });
  };

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2.5,
        mb: 3,
        backgroundColor: "#fafafa",
        borderLeft: "5px solid #1a237e",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: "block",
          fontWeight: "bold",
          color: "text.secondary",
          mb: 2,
          textTransform: "uppercase",
        }}
      >
        Year/Season Wise Orders - Selection Criteria (optional filters)
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            label="Year (optional)"
            size="small"
            fullWidth
            type="number"
            value={yearInput}
            onChange={(e) => handleYearChange(e.target.value)}
            slotProps={{ htmlInput: { min: 1900, max: 2100 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            select
            label="Season (optional)"
            size="small"
            fullWidth
            value={season}
            onChange={(e) => handleSeasonChange(e.target.value)}
          >
            <MenuItem value="">
              <em>All Seasons</em>
            </MenuItem>
            {seasonOptions.map((s) => (
              <MenuItem key={s.code} value={s.code}>
                {s.description}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Card>
  );
}
