import { useMemo, useState } from "react";
import {
  Box,
  Card,
  Grid,
  MenuItem,
  TextField,
  ThemeProvider,
  Typography,
  Button,
} from "@mui/material";
import StyleScopePicker, {
  type StyleScope,
} from "../style-scope/style-scope-picker.component";
import DailyProductionEntryTable from "./daily-production-entry-table.component";
import { useGetProductionLines } from "../../../tanstack-hooks/production-reference.hooks";
import { useGetUnits } from "../../../tanstack-hooks/custom-hooks";
import {
  useGetDailyProductionEntries,
  useGetCurrentLineAllocation,
  useBulkSaveDailyProductionEntriesMutation,
} from "../../../tanstack-hooks/daily-production-entry.hooks";
import type { DailyProductionEntry } from "../../../interfaces/production/DailyProductionEntry";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import ConfirmDialog from "../../common/confirm-dialog";

const today = () => new Date().toISOString().slice(0, 10);

const DailyProductionEntryWorkspace = () => {
  const [scope, setScope] = useState<StyleScope | null>(null);
  const [lineCode, setLineCode] = useState("");
  const [date, setDate] = useState(today());
  const [showSlipConfirm, setShowSlipConfirm] = useState(false);

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

  const { data: savedEntries, isLoading } = useGetDailyProductionEntries(date, entryScope);
  const { data: currentAllocation } = useGetCurrentLineAllocation(entryScope);
  const [rows, setRows] = useState<DailyProductionEntry[]>([]);

  // Reset local rows whenever the query result changes (new scope/date, or a
  // refetch after save) - done during render, per React's guidance on
  // "adjusting state when a prop changes", rather than in a useEffect, which
  // would commit the stale render first and then force a second one.
  const [syncedEntries, setSyncedEntries] = useState(savedEntries);
  if (savedEntries !== syncedEntries) {
    setSyncedEntries(savedEntries);
    setRows(savedEntries ?? []);
  }

  const handleChange = (sectionCode: string, field: "hours" | "unit" | "quantity", value: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.sectionCode === sectionCode
          ? { ...r, [field]: field === "unit" ? value : Number(value) }
          : r,
      ),
    );
  };

  const { mutateAsync: bulkSave, isPending: isSaving } = useBulkSaveDailyProductionEntriesMutation();

  const doSave = async () => {
    if (!entryScope) return;
    await bulkSave({
      date,
      scope: entryScope,
      records: rows.map((r) => ({
        sectionCode: r.sectionCode,
        hours: r.hours,
        unit: r.unit,
        quantity: r.quantity,
      })),
    });
  };

  const handleSaveClick = () => {
    // Warn before slipping the schedule - mirrors DailyProductionEntryService's
    // own "current slot" resolution (last allocation by start date) so the
    // warning only fires when the save is actually about to trigger the
    // slippage cascade on the backend.
    if (currentAllocation && date > currentAllocation.estimatedEndDate) {
      setShowSlipConfirm(true);
      return;
    }
    void doSave();
  };

  return (
    <div className="flex flex-col w-[80%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Actual Production Entry</Typography>
        </ThemeProvider>
      </div>

      <StyleScopePicker onScopeChange={(s) => { setScope(s); setLineCode(""); }} />

      {scope && (
        <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                select label="Line" size="small" fullWidth
                value={lineCode} onChange={(e) => setLineCode(e.target.value)}
              >
                {lineOptions.map((l) => (
                  <MenuItem key={l.lineCode} value={l.lineCode}>{l.lineCode} - {l.description}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Date" type="date" size="small" fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={date} onChange={(e) => setDate(e.target.value)}
              />
            </Grid>
          </Grid>
        </Card>
      )}

      {entryScope && (
        <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
          <DailyProductionEntryTable
            rows={rows}
            unitOptions={unitOptions}
            onChange={handleChange}
            isLoading={isLoading}
          />
          <Box sx={{ mt: 2, textAlign: "right" }}>
            <Button variant="contained" onClick={handleSaveClick} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save entries"}
            </Button>
          </Box>
        </Card>
      )}

      <ConfirmDialog
        open={showSlipConfirm}
        title="This will push the production schedule"
        message={
          currentAllocation
            ? `${date} is past line ${entryScope?.lineCode}'s current planned end ` +
              `(${currentAllocation.estimatedEndDate}). Saving will slip this allocation ` +
              `to ${date} and push every allocation queued after it on this line by the same amount. Continue?`
            : ""
        }
        confirmLabel="Continue"
        confirmColor="warning"
        isConfirming={isSaving}
        onConfirm={async () => {
          await doSave();
          setShowSlipConfirm(false);
        }}
        onCancel={() => setShowSlipConfirm(false)}
      />
    </div>
  );
};

export default DailyProductionEntryWorkspace;
