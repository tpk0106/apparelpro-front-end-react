import { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  MenuItem,
  TextField,
  ThemeProvider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
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

// Buyer + free-typed Style, matching PR_ESTL1.PRG exactly: the legacy screen
// takes a typed style code (with F1 help), not a cascading Order/Type/Style
// picker - this table has no Order/Type in its key at all (pre-order
// planning), so StyleScopePicker's 4-level cascade doesn't apply here.
const EstimatedProductionLineAllocationWorkspace = () => {
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
  const { mutateAsync: deleteAllocation } = useDeleteEstimatedProductionLineAllocationMutation();

  const handleAllocate = async () => {
    if (!selectedBuyer || !styleCode.trim()) return;
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
    <div className="flex flex-col w-[75%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Estimated Production Line Allocation</Typography>
        </ThemeProvider>
      </div>

      <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              options={buyersList}
              getOptionLabel={(o: Buyer) => o.name || ""}
              value={selectedBuyer}
              onChange={(_, v) => setSelectedBuyer(v)}
              isOptionEqualToValue={(o, v) => o.buyerCode === v?.buyerCode}
              renderInput={(params) => <TextField {...params} label="Select Buyer" size="small" />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Style Code" size="small" fullWidth disabled={!selectedBuyer}
              value={styleCode} onChange={(e) => setStyleCode(e.target.value)}
            />
          </Grid>
        </Grid>
      </Card>

      {scoped && (
        <>
          {allocation && (
            <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Current allocation</Typography>
              <Grid container spacing={2} sx={{ alignItems: "center" }}>
                <Grid size={{ xs: 4, sm: 2 }}><Typography variant="body2">Line: {allocation.lineCode}</Typography></Grid>
                <Grid size={{ xs: 4, sm: 2 }}><Typography variant="body2">Qty: {allocation.totalQuantity}</Typography></Grid>
                <Grid size={{ xs: 4, sm: 2 }}><Typography variant="body2">Days: {allocation.numberOfDays}</Typography></Grid>
                <Grid size={{ xs: 4, sm: 2 }}><Typography variant="body2">{allocation.estimatedStartDate} - {allocation.estimatedEndDate}</Typography></Grid>
                <Grid size={{ xs: 4, sm: 2 }}>
                  <Chip size="small" label={allocation.isCritical ? "Critical" : "OK"} color={allocation.isCritical ? "error" : "success"} />
                </Grid>
                <Grid size={{ xs: 4, sm: 2 }}>
                  <Button
                    size="small" color="error"
                    onClick={() => selectedBuyer && deleteAllocation({ buyerCode: selectedBuyer.buyerCode, styleCode: styleCode.trim() })}
                  >
                    Delete
                  </Button>
                </Grid>
              </Grid>
            </Card>
          )}

          <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
            <ToggleButtonGroup value={mode} exclusive onChange={(_, v) => v && setMode(v)} size="small" sx={{ mb: 2 }}>
              <ToggleButton value="automatic">Automatic</ToggleButton>
              <ToggleButton value="manual">Manual</ToggleButton>
            </ToggleButtonGroup>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Est. Production / day" type="number" size="small" fullWidth
                  value={estimatedProductionPerDay} onChange={(e) => setEstimatedProductionPerDay(Number(e.target.value))}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField select label="Unit" size="small" fullWidth value={unit} onChange={(e) => setUnit(e.target.value)}>
                  {unitOptions.map((u) => (
                    <MenuItem key={u.code} value={u.code}>{u.code} - {u.description}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField
                  label="Lead Time (days)" type="number" size="small" fullWidth
                  value={leadTimeDays} onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField
                  label="Total Quantity" type="number" size="small" fullWidth
                  value={totalQuantity} onChange={(e) => setTotalQuantity(Number(e.target.value))}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  label="Date of Shipment" type="date" size="small" fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={shipDate} onChange={(e) => setShipDate(e.target.value)}
                />
              </Grid>

              {mode === "manual" && (
                <>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField select label="Line" size="small" fullWidth value={lineCode} onChange={(e) => setLineCode(e.target.value)}>
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
                    />
                  </Grid>
                </>
              )}
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Button variant="contained" onClick={handleAllocate} disabled={isManualPending || isAutoPending}>
                {mode === "automatic" ? "Run automatic allocation" : "Allocate"}
              </Button>
            </Box>
          </Card>
        </>
      )}
    </div>
  );
};

export default EstimatedProductionLineAllocationWorkspace;
