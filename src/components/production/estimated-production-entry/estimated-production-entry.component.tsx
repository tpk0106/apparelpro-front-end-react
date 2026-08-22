import { useMemo, useState } from "react";
import { Alert, Box, Grid, MenuItem, TextField, ThemeProvider, Typography } from "@mui/material";
import StyleScopePicker, {
  type StyleScope,
} from "../style-scope/style-scope-picker.component";
import EstimatedProductionEntryTable from "./estimated-production-entry-table.component";
import { useGetProductionLines } from "../../../tanstack-hooks/production-reference.hooks";
import { useGetUnits } from "../../../tanstack-hooks/custom-hooks";
import { useGetEstimatedProductionEntries } from "../../../tanstack-hooks/estimated-production-entry.hooks";
import type { EstimatedProductionEntry } from "../../../interfaces/production/EstimatedProductionEntry";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";

const EstimatedProductionEntryWorkspace = () => {
  const [scope, setScope] = useState<StyleScope | null>(null);
  const [lineCode, setLineCode] = useState("");
  const [unit, setUnit] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: linePageData } = useGetProductionLines({
    pageIndex: 0, pageSize: 999, sortColumn: "lineCode", sortOrder: "asc",
    filterColumn: null, filterQuery: null,
  });
  const lineOptions = linePageData?.items ?? [];

  const { data: unitPageData } = useGetUnits({
    pageIndex: 0, pageSize: 999, sortColumn: "code", sortOrder: "asc",
    filterColumn: null, filterQuery: null,
  });
  const unitOptions = unitPageData?.items ?? [];

  const entryScope = useMemo(
    () => (scope && lineCode ? { ...scope, lineCode } : null),
    [scope, lineCode],
  );

  const { data: savedEntries, isLoading } = useGetEstimatedProductionEntries(entryScope);
  const [rows, setRows] = useState<EstimatedProductionEntry[]>([]);

  // Reset local rows (and default the unit) whenever the query result
  // changes (new scope, or a refetch after save) - done during render, per
  // React's guidance on "adjusting state when a prop changes", rather than
  // in a useEffect, which would commit the stale render first and then
  // force a second one.
  const [syncedEntries, setSyncedEntries] = useState(savedEntries);
  if (savedEntries !== syncedEntries) {
    setSyncedEntries(savedEntries);
    setRows(savedEntries ?? []);
    if (savedEntries && savedEntries.length > 0) {
      setUnit(savedEntries[0].unit);
    }
  }

  const scopedRows = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        buyerCode: entryScope?.buyerCode ?? r.buyerCode,
        order: entryScope?.order ?? r.order,
        typeCode: entryScope?.typeCode ?? r.typeCode,
        styleCode: entryScope?.styleCode ?? r.styleCode,
        lineCode: entryScope?.lineCode ?? r.lineCode,
        unit: unit || r.unit,
      })),
    [rows, entryScope, unit],
  );

  return (
    <div className="flex flex-col w-[80%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Estimated Production Entry</Typography>
        </ThemeProvider>
      </div>

      <StyleScopePicker onScopeChange={(s) => { setScope(s); setLineCode(""); setSaveError(null); }} />

      {scope && (
        <Box sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 1, backgroundColor: "#fafafa" }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                select label="Line" size="small" fullWidth
                value={lineCode} onChange={(e) => { setLineCode(e.target.value); setSaveError(null); }}
              >
                {lineOptions.map((l) => (
                  <MenuItem key={l.lineCode} value={l.lineCode}>{l.lineCode} - {l.description}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                select label="Unit" size="small" fullWidth
                value={unit} onChange={(e) => setUnit(e.target.value)}
              >
                {unitOptions.map((u) => (
                  <MenuItem key={u.code} value={u.code}>{u.code} - {u.description}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>
      )}

      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>
      )}

      {entryScope && unit && (
        <Box>
          <EstimatedProductionEntryTable
            scope={entryScope}
            unit={unit}
            rows={scopedRows}
            setRows={setRows}
            isLoading={isLoading}
            onSaveError={setSaveError}
          />
        </Box>
      )}
    </div>
  );
};

export default EstimatedProductionEntryWorkspace;
