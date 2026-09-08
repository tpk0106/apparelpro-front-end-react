import { useState } from "react";
import { toast } from "react-toastify";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
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
import type { Buyer } from "../../../interfaces/references/Buyer";
import { useGetBuyersQuery } from "../../../tanstack-hooks/custom-hooks";
import { useGetProductionLines } from "../../../tanstack-hooks/production-reference.hooks";
import { useGetUnits } from "../../../tanstack-hooks/custom-hooks";
import {
  useGetEstimatedProductionLineAllocation,
  useManualAllocateEstimatedProductionLineMutation,
  useAutomaticAllocateEstimatedProductionLineMutation,
  useDeleteEstimatedProductionLineAllocationMutation,
} from "../../../tanstack-hooks/production-line-allocation.hooks";
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
  deleteRowIconButtonSx,
} from "../../../themes/workspace-theme";
import ConfirmDialog from "../../common/confirm-dialog";

// Buyer + free-typed Style, matching PR_ESTL1.PRG exactly: the legacy screen
// takes a typed style code (with F1 help), not a cascading Order/Type/Style
// picker - this table has no Order/Type in its key at all (pre-order
// planning), so StyleScopePicker's 4-level cascade doesn't apply here.
const EstimatedProductionLineAllocationWorkspace = () => {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const dropdownMenuSlotProps = { select: { MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } } };
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [styleCode, setStyleCode] = useState("");
  const [mode, setMode] = useState<"automatic" | "manual">("automatic");

  const [estimatedProductionPerDay, setEstimatedProductionPerDay] = useState(0);
  const [unit, setUnit] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [shipDate, setShipDate] = useState("");
  const [lineCode, setLineCode] = useState("");
  const [estimatedStartDate, setEstimatedStartDate] = useState("");

  const { data: buyerPageData } = useGetBuyersQuery({
    pageIndex: 0, pageSize: 999, sortColumn: "name", sortOrder: "asc",
    filterColumn: null, filterQuery: null,
  });
  const buyersList = buyerPageData?.items ?? [];

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

  const scoped = !!selectedBuyer && !!styleCode.trim();
  const { data: allocation } = useGetEstimatedProductionLineAllocation(
    selectedBuyer?.buyerCode ?? null,
    scoped ? styleCode.trim() : null,
  );

  const { mutateAsync: manualAllocate, isPending: isManualPending } = useManualAllocateEstimatedProductionLineMutation();
  const { mutateAsync: automaticAllocate, isPending: isAutoPending } = useAutomaticAllocateEstimatedProductionLineMutation();
  const { mutateAsync: deleteAllocation, isPending: isDeletingAllocation } = useDeleteEstimatedProductionLineAllocationMutation();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleConfirmDeleteAllocation = () => {
    if (!selectedBuyer) return;
    deleteAllocation(
      { buyerCode: selectedBuyer.buyerCode, styleCode: styleCode.trim() },
      { onSettled: () => setIsDeleteConfirmOpen(false) },
    );
  };

  // Same reasoning as production-line-allocation.component.tsx: Unit/Est.
  // Production per day/Total Quantity/Ship Date have no server-side default
  // to fall back to, so leaving them blank/0 must block submission - unlike
  // Number of Machines elsewhere, which legacy FACTPARA.no_mcs defaults for.
  const getAllocationValidationError = (): string | null => {
    if (!unit.trim()) return "Select a Unit before allocating.";
    if (estimatedProductionPerDay <= 0) return "Enter Est. Production / day greater than 0.";
    if (totalQuantity <= 0) return "Enter a Total Quantity greater than 0.";
    if (!shipDate.trim()) return "Enter a Date of Shipment before allocating.";
    if (mode === "manual") {
      if (!lineCode.trim()) return "Select a Line before allocating.";
      if (!estimatedStartDate.trim()) return "Enter an Est. Start Date before allocating.";
    }
    return null;
  };

  const handleAllocate = async () => {
    if (!selectedBuyer || !styleCode.trim()) return;
    const validationError = getAllocationValidationError();
    if (validationError) {
      toast.warning(validationError);
      return;
    }
    if (mode === "automatic") {
      await automaticAllocate({
        buyerCode: selectedBuyer.buyerCode,
        styleCode: styleCode.trim(),
        estimatedProductionPerDay,
        unit,
        leadTimeDays,
        totalQuantity,
        shipDate,
      });
    } else {
      await manualAllocate({
        buyerCode: selectedBuyer.buyerCode,
        styleCode: styleCode.trim(),
        estimatedProductionPerDay,
        unit,
        leadTimeDays,
        totalQuantity,
        shipDate,
        lineCode,
        estimatedStartDate,
      });
    }
  };

  return (
    <div className="flex flex-col w-[75%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography sx={workspaceHeadingSx}>Estimated Production Line Allocation</Typography>
        </ThemeProvider>
      </div>

      <Card
        variant="outlined"
        sx={{ p: 2, mb: 2, backgroundColor: DASHBOARD_COLORS.cardBg, borderColor: DASHBOARD_COLORS.border }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              options={buyersList}
              getOptionLabel={(o: Buyer) => o.name || ""}
              value={selectedBuyer}
              onChange={(_, v) => setSelectedBuyer(v)}
              isOptionEqualToValue={(o, v) => o.buyerCode === v?.buyerCode}
              slotProps={{ listbox: { sx: dropdownListboxSx } }}
              renderInput={(params) => <TextField {...params} label="Select Buyer" size="small" sx={dropdownFieldSx} />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Style Code" size="small" fullWidth disabled={!selectedBuyer}
              value={styleCode} onChange={(e) => setStyleCode(e.target.value)}
              sx={dropdownFieldSx}
            />
          </Grid>
        </Grid>
      </Card>

      {scoped && (
        <>
          {allocation && (
            <Card
              variant="outlined"
              sx={{ p: 2, mb: 2, backgroundColor: DASHBOARD_COLORS.cardBg, borderColor: DASHBOARD_COLORS.border }}
            >
              <Typography variant="subtitle2" sx={{ ...workspaceSectionLabelSx, mb: 1 }}>Current allocation</Typography>
              <Grid container spacing={2} sx={{ alignItems: "center" }}>
                <Grid size={{ xs: 4, sm: 2 }}><Typography variant="body2">Line: {allocation.lineCode}</Typography></Grid>
                <Grid size={{ xs: 4, sm: 2 }}><Typography variant="body2">Qty: {allocation.totalQuantity}</Typography></Grid>
                <Grid size={{ xs: 4, sm: 2 }}><Typography variant="body2">Days: {allocation.numberOfDays}</Typography></Grid>
                <Grid size={{ xs: 4, sm: 2 }}><Typography variant="body2">{allocation.estimatedStartDate} - {allocation.estimatedEndDate}</Typography></Grid>
                <Grid size={{ xs: 4, sm: 2 }}>
                  <Chip size="small" label={allocation.isCritical ? "Critical" : "OK"} color={allocation.isCritical ? "error" : "success"} />
                </Grid>
                <Grid size={{ xs: 4, sm: 2 }}>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    sx={deleteRowIconButtonSx}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Grid>
              </Grid>
            </Card>
          )}

          <Card
            variant="outlined"
            sx={{ p: 2, mb: 2, backgroundColor: DASHBOARD_COLORS.cardBg, borderColor: DASHBOARD_COLORS.border }}
          >
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, v) => v && setMode(v)}
              size="small"
              sx={{
                mb: 2,
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

            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Est. Production / day" type="number" size="small" fullWidth
                  value={estimatedProductionPerDay} onChange={(e) => setEstimatedProductionPerDay(Number(e.target.value))}
                  sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip
                            title="Manual entry only here - this is pre-order planning (Buyer/Style
                              only, no Order/Type yet), so there's no Style Operation Breakdown to
                              calculate a suggestion from. Once the style has a real Order, use
                              Production Line Allocation instead, which suggests this value
                              automatically from that style's operation times."
                            arrow
                          >
                            <InfoOutlinedIcon fontSize="small" sx={{ color: "text.secondary", cursor: "help" }} />
                          </Tooltip>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField
                  select label="Unit" size="small" fullWidth value={unit} onChange={(e) => setUnit(e.target.value)}
                  sx={dropdownFieldSx}
                  slotProps={dropdownMenuSlotProps}
                >
                  {unitOptions.map((u) => (
                    <MenuItem key={u.code} value={u.code}>{u.code} - {u.description}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField
                  label="Lead Time (days)" type="number" size="small" fullWidth
                  value={leadTimeDays} onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                  sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField
                  label="Total Quantity" type="number" size="small" fullWidth
                  value={totalQuantity} onChange={(e) => setTotalQuantity(Number(e.target.value))}
                  sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Date of Shipment" type="date" size="small" fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={shipDate} onChange={(e) => setShipDate(e.target.value)}
                  sx={{ ...dropdownFieldSx, ...(dateIconFieldSx as Record<string, unknown>) }}
                />
              </Grid>

              {mode === "manual" && (
                <>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      select label="Line" size="small" fullWidth value={lineCode} onChange={(e) => setLineCode(e.target.value)}
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
                      label="Est. Start Date" type="date" size="small" fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={estimatedStartDate} onChange={(e) => setEstimatedStartDate(e.target.value)}
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
        open={isDeleteConfirmOpen}
        title="Delete Line Allocation"
        message={`Delete the line allocation for style "${styleCode.trim()}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeletingAllocation}
        onConfirm={handleConfirmDeleteAllocation}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};

export default EstimatedProductionLineAllocationWorkspace;
