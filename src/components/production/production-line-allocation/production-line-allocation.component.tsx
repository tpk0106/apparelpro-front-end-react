import { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
  Grid,
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
import StyleScopePicker, {
  type StyleScope,
} from "../style-scope/style-scope-picker.component";
import { useGetPartShipmentsLedgerQuery } from "../../../services/order-management/part-shipment.service";
import { useGetProductionLines } from "../../../tanstack-hooks/production-reference.hooks";
import { useGetUnits } from "../../../tanstack-hooks/custom-hooks";
import {
  useGetProductionLineAllocationsByShipment,
  useManualAllocateProductionLineMutation,
  useAutomaticAllocateProductionLineMutation,
  useDeleteProductionLineAllocationMutation,
} from "../../../tanstack-hooks/production-line-allocation.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";

const ProductionLineAllocationWorkspace = () => {
  const [scope, setScope] = useState<StyleScope | null>(null);
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

  const { mutateAsync: manualAllocate, isPending: isManualPending } =
    useManualAllocateProductionLineMutation();
  const { mutateAsync: automaticAllocate, isPending: isAutoPending } =
    useAutomaticAllocateProductionLineMutation();
  const { mutateAsync: deleteAllocation } =
    useDeleteProductionLineAllocationMutation();

  const handleAllocate = async () => {
    if (!allocationScope) return;
    if (mode === "automatic") {
      await automaticAllocate({
        ...allocationScope,
        estimatedProductionPerDay,
        unit,
        leadTimeDays,
        numberOfMachines,
      });
    } else {
      await manualAllocate({
        ...allocationScope,
        lineCode,
        estimatedProductionPerDay,
        unit,
        leadTimeDays,
        numberOfMachines,
        totalQuantity,
        estimatedStartDate,
      });
    }
  };

  return (
    <div className="flex flex-col w-[85%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Production Line Allocation</Typography>
        </ThemeProvider>
      </div>

      <StyleScopePicker
        onScopeChange={(s) => {
          setScope(s);
          setShipmentOrder(null);
        }}
      />

      {scope && (
        <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Autocomplete
            options={shipments}
            getOptionLabel={(o) => o.newOrder}
            onChange={(_, v) => setShipmentOrder(v?.newOrder ?? null)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Shipment Order"
                size="small"
                sx={{ maxWidth: 300 }}
              />
            )}
          />
        </Card>
      )}

      {allocationScope && (
        <>
          <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Current allocations
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Line</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {allocations.map((a) => (
                  <TableRow key={a.lineCode}>
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
                      <Button
                        size="small"
                        color="error"
                        onClick={() =>
                          deleteAllocation({
                            ...allocationScope,
                            lineCode: a.lineCode,
                          })
                        }
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card
            variant="outlined"
            sx={{ p: 2, mb: 2, backgroundColor: "#ffffff" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(_, v) => v && setMode(v)}
                size="small"
              >
                <ToggleButton value="automatic">Automatic</ToggleButton>
                <ToggleButton value="manual">Manual</ToggleButton>
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
              >
                {mode === "automatic" ? "Run automatic allocation" : "Allocate"}
              </Button>
            </Box>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProductionLineAllocationWorkspace;
