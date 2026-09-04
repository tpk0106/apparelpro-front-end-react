import { useMemo, useState } from "react";
import { toast } from "react-toastify";
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
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../../themes/useDropdownTheme";
import {
  workspaceHeadingSx,
  dateIconFieldSx,
  primaryActionButtonSx,
  themedButtonLabelStyle,
} from "../../../themes/workspace-theme";

const today = () => new Date().toISOString().slice(0, 10);

const DailyProductionEntryWorkspace = () => {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const dropdownMenuSlotProps = { select: { MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } } };
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

  // Mirrors legacy PR_DPRO1.PRG's rules for this same screen: Hours must be
  // in (0, 24] ("valid hours > 0 .and. hours <= 24"), and a section can't
  // report a quantity without Unit and Hours filled in first (legacy hard-blocks
  // entering a quantity with "Please enter [Buyer/Order/Type/Style/Line/Unit/Hours]
  // First" - Buyer/Order/Type/Style/Line are already required just to reach this
  // table here, so Unit/Hours are what's left to enforce at the row level).
  // Previously none of this was checked - Save fired unconditionally, even
  // with every row still blank.
  const getEntryValidationError = (): string | null => {
    const rowsWithQuantity = rows.filter((r) => r.quantity > 0);
    if (rowsWithQuantity.length === 0) {
      return "Enter at least one section's quantity before saving.";
    }
    for (const r of rowsWithQuantity) {
      if (r.hours <= 0 || r.hours > 24) {
        return `Enter valid Hours (0-24) for ${r.sectionDescription}.`;
      }
      if (!r.unit.trim()) {
        return `Select a Unit for ${r.sectionDescription}.`;
      }
    }
    return null;
  };

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
    const validationError = getEntryValidationError();
    if (validationError) {
      toast.warning(validationError);
      return;
    }
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
    <div className="flex flex-col w-[80%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography sx={workspaceHeadingSx}>Actual Production Entry</Typography>
        </ThemeProvider>
      </div>

      <StyleScopePicker onScopeChange={(s) => { setScope(s); setLineCode(""); }} />

      {scope && (
        <Card
          variant="outlined"
          sx={{ p: 2, mb: 2, backgroundColor: DASHBOARD_COLORS.cardBg, borderColor: DASHBOARD_COLORS.border }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                select label="Line" size="small" fullWidth
                value={lineCode} onChange={(e) => setLineCode(e.target.value)}
                sx={dropdownFieldSx}
                slotProps={dropdownMenuSlotProps}
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
                sx={{ ...dropdownFieldSx, ...(dateIconFieldSx as Record<string, unknown>) }}
              />
            </Grid>
          </Grid>
        </Card>
      )}

      {entryScope && (
        <Card
          variant="outlined"
          sx={{ p: 2, mb: 2, backgroundColor: DASHBOARD_COLORS.cardBg, borderColor: DASHBOARD_COLORS.border }}
        >
          <DailyProductionEntryTable
            rows={rows}
            unitOptions={unitOptions}
            onChange={handleChange}
            isLoading={isLoading}
          />
          <Box sx={{ mt: 2, textAlign: "right" }}>
            <Button variant="contained" onClick={handleSaveClick} disabled={isSaving} sx={primaryActionButtonSx}>
              <span style={themedButtonLabelStyle}>{isSaving ? "Saving..." : "Save entries"}</span>
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
