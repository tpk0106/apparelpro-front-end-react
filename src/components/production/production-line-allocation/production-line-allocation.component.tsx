import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ThemeProvider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StyleScopePicker, {
  type StyleScope,
} from "../style-scope/style-scope-picker.component";
import { useGetPartShipmentsLedgerQuery } from "../../../services/order-management/part-shipment.service";
import { useGetProductionLines } from "../../../tanstack-hooks/production-reference.hooks";
import { useGetUnits, useGetSystemParametersQuery } from "../../../tanstack-hooks/custom-hooks";
import {
  useGetProductionLineAllocationsByShipment,
  useManualAllocateProductionLineMutation,
  useAutomaticAllocateProductionLineMutation,
  useDeleteProductionLineAllocationMutation,
} from "../../../tanstack-hooks/production-line-allocation.hooks";
import { useGetOperationBreakdownByStyle } from "../../../tanstack-hooks/production-style-breakdown.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../../themes/useDropdownTheme";
import { oliveGlossSx } from "../../../themes/button-color-themes";
import {
  workspaceHeadingSx,
  workspaceSectionLabelSx,
  primaryActionButtonSx,
  themedButtonLabelStyle,
  dateIconFieldSx,
  numberFieldNoSpinnerSx,
  plainTableHeaderRowSx,
  plainTableHeaderCellSx,
  plainTableBodyRowSx,
  deleteRowIconButtonSx,
} from "../../../themes/workspace-theme";
import ConfirmDialog from "../../common/confirm-dialog";

const ProductionLineAllocationWorkspace = () => {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const dropdownMenuSlotProps = { select: { MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } } };
  const [scope, setScope] = useState<StyleScope | null>(null);
  const [allocationToDelete, setAllocationToDelete] = useState<string | null>(null);
  const [shipmentOrder, setShipmentOrder] = useState<string | null>(null);
  const [mode, setMode] = useState<"automatic" | "manual">("automatic");

  const [estimatedProductionPerDay, setEstimatedProductionPerDay] = useState(0);
  const [unit, setUnit] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState(0);
  const [numberOfMachines, setNumberOfMachines] = useState(0);
  const [lineCode, setLineCode] = useState("");
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [estimatedStartDate, setEstimatedStartDate] = useState("");

  const { data: shipments = [] } = useGetPartShipmentsLedgerQuery(scope!, {
    skip: !scope,
  });

  const allocationScope =
    scope && shipmentOrder ? { ...scope, shipmentOrder } : null;
  const { data: allocations = [] } =
    useGetProductionLineAllocationsByShipment(allocationScope);

  const { data: linePageData } = useGetProductionLines({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "lineCode",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const lineOptions = linePageData?.items ?? [];

  const { data: unitPageData } = useGetUnits({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const unitOptions = unitPageData?.items ?? [];

  // "Production Default Machine Count Per Line" (System Parameters > Production
  // Control) - legacy FACTPARA.no_mcs's modern equivalent. Leaving Number of
  // Machines at 0 falls back to this instead of sending a meaningless 0.
  const { data: systemParameters = [] } = useGetSystemParametersQuery();
  const defaultMachineCount = Number(
    systemParameters.find((p) => p.parameterKey === "ProductionDefaultMachineCountPerLine")?.value ?? 0,
  );
  const efficiency2Percent = Number(
    systemParameters.find((p) => p.parameterKey === "ProductionEfficiency2Percent")?.value ?? 0,
  );
  const workHoursPerDay = Number(
    systemParameters.find((p) => p.parameterKey === "ProductionWorkHoursPerDay")?.value ?? 0,
  );

  // Legacy PR_OPD2.PRG's line-capacity formula (see memory note on this
  // session's investigation): TotalSAM (sum of every operation's Standard
  // Allowed Minutes for this style, from Style Operation Breakdown) gives
  // pieces/machine/day at 100% via (WorkHoursPerDay*60)/TotalSAM, scaled by
  // factory efficiency% and the line's machine count. Legacy pre-filled
  // "Est. Production per day" with exactly this (PR_ESTM1.PRG's
  // `m_e_prod = m_estprd`), while still leaving it fully editable - same
  // approach here: a suggestion, never forced.
  // NOTE: legacy's m_totsam excluded "manual" (non-machine) operations from
  // the sum; the modern StyleOperationBreakdown record has no equivalent
  // flag to filter on, so this sums every operation's SAM - a reasonable
  // approximation, not a byte-for-byte port of that exclusion rule.
  const { data: styleOperations = [] } = useGetOperationBreakdownByStyle(scope);
  const totalSam = styleOperations.reduce((sum, op) => sum + op.sam, 0);
  const machineCountForEstimate = numberOfMachines > 0 ? numberOfMachines : defaultMachineCount;
  const suggestedProductionPerDay =
    totalSam > 0 && workHoursPerDay > 0
      ? Math.round(((workHoursPerDay * 60) / totalSam) * (efficiency2Percent / 100) * machineCountForEstimate)
      : 0;

  // Pre-fill Est. Production/day once per style scope, matching legacy's
  // "only for a fresh/new allocation" behavior (PR_ESTM1.PRG's
  // `m_e_prod = m_estprd`) - never overwrites something the planner already
  // typed, and never re-applies again for the same scope even if they clear
  // it back to 0 afterward. This has to be a real effect (not the
  // "adjust state during render" pattern used elsewhere in this file) because
  // the operation breakdown this depends on arrives asynchronously - the
  // suggestion often isn't known yet on the same render the scope changes.
  const scopeKey = scope
    ? `${scope.buyerCode}|${scope.order}|${scope.typeCode}|${scope.styleCode}`
    : null;
  const [suggestionAppliedForScope, setSuggestionAppliedForScope] = useState<string | null>(null);
  useEffect(() => {
    if (!scopeKey || scopeKey === suggestionAppliedForScope || suggestedProductionPerDay <= 0) return;
    setEstimatedProductionPerDay(suggestedProductionPerDay);
    setSuggestionAppliedForScope(scopeKey);
  }, [scopeKey, suggestedProductionPerDay, suggestionAppliedForScope]);

  const { mutateAsync: manualAllocate, isPending: isManualPending } =
    useManualAllocateProductionLineMutation();
  const { mutateAsync: automaticAllocate, isPending: isAutoPending } =
    useAutomaticAllocateProductionLineMutation();
  const { mutateAsync: deleteAllocation, isPending: isDeleting } =
    useDeleteProductionLineAllocationMutation();

  const handleConfirmDeleteAllocation = async () => {
    if (!allocationScope || !allocationToDelete) return;
    await deleteAllocation({ ...allocationScope, lineCode: allocationToDelete });
    setAllocationToDelete(null);
  };

  // numberOfMachines is deliberately NOT required here - legacy PR_PARA1.PRG
  // stores "No. of Machines per Line" as a factory-wide default (FACTPARA.no_mcs),
  // whose modern equivalent is the "Production Default Machine Count Per Line"
  // System Parameter (see defaultMachineCount above) - leaving the field at 0
  // falls back to that value at submit time instead of sending a meaningless 0.
  // Everything else has no such fallback: leaving Unit blank or Est.
  // Production/day at 0 makes the days-needed calculation meaningless, but
  // nothing previously stopped the request from firing (and "succeeding")
  // with those left empty.
  const getAllocationValidationError = (): string | null => {
    if (!unit.trim()) return "Select a Unit before allocating.";
    if (estimatedProductionPerDay <= 0) return "Enter Est. Production / day greater than 0.";
    if (mode === "manual") {
      if (!lineCode.trim()) return "Select a Line before allocating.";
      if (totalQuantity <= 0) return "Enter a Quantity to Allocate greater than 0.";
      if (!estimatedStartDate.trim()) return "Enter an Est. Start Date before allocating.";
    }
    return null;
  };

  const handleAllocate = async () => {
    if (!allocationScope) return;
    const validationError = getAllocationValidationError();
    if (validationError) {
      toast.warning(validationError);
      return;
    }
    const effectiveNumberOfMachines = numberOfMachines > 0 ? numberOfMachines : defaultMachineCount;
    if (mode === "automatic") {
      await automaticAllocate({
        ...allocationScope,
        estimatedProductionPerDay,
        unit,
        leadTimeDays,
        numberOfMachines: effectiveNumberOfMachines,
      });
    } else {
      await manualAllocate({
        ...allocationScope,
        lineCode,
        estimatedProductionPerDay,
        unit,
        leadTimeDays,
        numberOfMachines: effectiveNumberOfMachines,
        totalQuantity,
        estimatedStartDate,
      });
    }
  };

  return (
    <div className="flex flex-col w-[85%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography sx={workspaceHeadingSx}>Production Line Allocation</Typography>
        </ThemeProvider>
      </div>

      <StyleScopePicker
        onScopeChange={(s) => {
          setScope(s);
          setShipmentOrder(null);
        }}
      />

      {scope && (
        <Card
          variant="outlined"
          sx={{ p: 2, mb: 2, backgroundColor: DASHBOARD_COLORS.cardBg, borderColor: DASHBOARD_COLORS.border }}
        >
          <Autocomplete
            options={shipments}
            getOptionLabel={(o) => o.newOrder}
            onChange={(_, v) => setShipmentOrder(v?.newOrder ?? null)}
            slotProps={{ listbox: { sx: dropdownListboxSx } }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Shipment Order"
                size="small"
                sx={{ maxWidth: 300, ...dropdownFieldSx }}
              />
            )}
          />
        </Card>
      )}

      {allocationScope && (
        <>
          <Card
            variant="outlined"
            sx={{ p: 2, mb: 2, backgroundColor: DASHBOARD_COLORS.cardBg, borderColor: DASHBOARD_COLORS.border }}
          >
            <Typography variant="subtitle2" sx={{ ...workspaceSectionLabelSx, mb: 1 }}>
              Current allocations
            </Typography>
            <Table size="small" sx={{ border: `1px solid ${DASHBOARD_COLORS.border}` }}>
              <TableHead>
                <TableRow sx={plainTableHeaderRowSx()}>
                  <TableCell sx={plainTableHeaderCellSx()}>Line</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>Qty</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>Days</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>Start</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>End</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()}>Status</TableCell>
                  <TableCell sx={plainTableHeaderCellSx()} />
                </TableRow>
              </TableHead>
              <TableBody>
                {allocations.map((a, idx) => (
                  <TableRow key={a.lineCode} sx={plainTableBodyRowSx(idx)}>
                    <TableCell>{a.lineCode}</TableCell>
                    <TableCell>{a.totalQuantity}</TableCell>
                    <TableCell>{a.numberOfDays}</TableCell>
                    <TableCell>{a.estimatedStartDate}</TableCell>
                    <TableCell>{a.estimatedEndDate}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={a.isCritical ? "Critical" : "OK"}
                        color={a.isCritical ? "error" : "success"}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => setAllocationToDelete(a.lineCode)}
                        sx={deleteRowIconButtonSx}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card
            variant="outlined"
            sx={{ p: 2, mb: 2, backgroundColor: DASHBOARD_COLORS.cardBg, borderColor: DASHBOARD_COLORS.border }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(_, v) => v && setMode(v)}
                size="small"
                sx={{
                  ...oliveGlossSx,
                  borderRadius: 1,
                  p: "3px",
                  "& .MuiToggleButton-root": {
                    position: "relative",
                    zIndex: 1,
                    color: "#F3EADF",
                    fontWeight: "bold",
                    border: "none",
                    borderRadius: "6px !important",
                    px: 2,
                    "&.Mui-selected": { ...primaryActionButtonSx },
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
                  },
                }}
              >
                <ToggleButton value="automatic">
                  {mode === "automatic" && (
                    <CheckCircleIcon sx={{ fontSize: 16, mr: 0.5, position: "relative", zIndex: 1 }} />
                  )}
                  <span style={themedButtonLabelStyle}>Automatic</span>
                </ToggleButton>
                <ToggleButton value="manual">
                  {mode === "manual" && (
                    <CheckCircleIcon sx={{ fontSize: 16, mr: 0.5, position: "relative", zIndex: 1 }} />
                  )}
                  <span style={themedButtonLabelStyle}>Manual</span>
                </ToggleButton>
              </ToggleButtonGroup>
              <Tooltip
                title={
                  mode === "automatic"
                    ? "Automatic allocation always queues the shipment onto a line " +
                      "after whatever is already committed there, so it can never " +
                      "overlap another style's dates on the same line."
                    : "Manual allocation lets you pick any start date. A line can only " +
                      "run one job at a time, so a start/end range that overlaps another " +
                      "style already committed to this line will be rejected - choose a " +
                      "free date range, or use Automatic to have it queued for you."
                }
                arrow
              >
                <InfoOutlinedIcon fontSize="small" sx={{ color: "text.secondary", cursor: "help" }} />
              </Tooltip>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Est. Production / day"
                  type="number"
                  size="small"
                  fullWidth
                  value={estimatedProductionPerDay}
                  onChange={(e) =>
                    setEstimatedProductionPerDay(Number(e.target.value))
                  }
                  helperText={
                    suggestedProductionPerDay > 0
                      ? `Suggested from Style Operation Breakdown: ${suggestedProductionPerDay}/day`
                      : "No Style Operation Breakdown yet - enter manually"
                  }
                  sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField
                  select
                  label="Unit"
                  size="small"
                  fullWidth
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  sx={dropdownFieldSx}
                  slotProps={dropdownMenuSlotProps}
                >
                  {unitOptions.map((u) => (
                    <MenuItem key={u.code} value={u.code}>
                      {u.code} - {u.description}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField
                  label="Lead Time (days)"
                  type="number"
                  size="small"
                  fullWidth
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                  sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField
                  label="No. of Machines"
                  type="number"
                  size="small"
                  fullWidth
                  value={numberOfMachines}
                  onChange={(e) => setNumberOfMachines(Number(e.target.value))}
                  helperText={`0 = default (${defaultMachineCount})`}
                  sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
                />
              </Grid>

              {mode === "manual" && (
                <>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      select
                      label="Line"
                      size="small"
                      fullWidth
                      value={lineCode}
                      onChange={(e) => setLineCode(e.target.value)}
                      sx={dropdownFieldSx}
                      slotProps={dropdownMenuSlotProps}
                    >
                      {lineOptions.map((l) => (
                        <MenuItem key={l.lineCode} value={l.lineCode}>
                          {l.lineCode} - {l.description}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label="Quantity to Allocate"
                      type="number"
                      size="small"
                      fullWidth
                      value={totalQuantity}
                      onChange={(e) => setTotalQuantity(Number(e.target.value))}
                      sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label="Est. Start Date"
                      type="date"
                      size="small"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={estimatedStartDate}
                      onChange={(e) => setEstimatedStartDate(e.target.value)}
                      sx={{ ...dropdownFieldSx, ...(dateIconFieldSx as Record<string, unknown>) }}
                    />
                  </Grid>
                </>
              )}
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleAllocate}
                disabled={isManualPending || isAutoPending}
                sx={primaryActionButtonSx}
              >
                <span style={themedButtonLabelStyle}>
                  {mode === "automatic" ? "Run automatic allocation" : "Allocate"}
                </span>
              </Button>
            </Box>
          </Card>
        </>
      )}

      <ConfirmDialog
        open={!!allocationToDelete}
        title="Remove Allocation"
        message={`Remove the allocation on line "${allocationToDelete}"? This cannot be undone.`}
        confirmLabel="Remove"
        confirmColor="error"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDeleteAllocation}
        onCancel={() => setAllocationToDelete(null)}
      />
    </div>
  );
};

export default ProductionLineAllocationWorkspace;
