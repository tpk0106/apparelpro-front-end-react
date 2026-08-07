import { useState, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  Autocomplete,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CalculateIcon from "@mui/icons-material/Calculate";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { toast } from "react-toastify";
import type {
  StyleContext,
  MaterialSelection,
  FormInputs,
} from "./material-consumption.types";

// Import your custom hooks from your services slice
import {
  useGetDynamicFeatureHeaders,
  useCalculateConsumptionMutation,
  useSaveConsumptionEntryMutation,
} from "../../tanstack-hooks/material-consumption-entry.hooks";
import {
  useGetUnits,
  useGetStyleDimensions,
  useGetSuppliersLookup,
} from "../../tanstack-hooks/custom-hooks";
import type { SupplierServiceModel } from "../../tanstack-hooks/interfaces";
import type { Unit } from "../../interfaces/references/Unit";
import type { AppError } from "../../auth/axiosClient";

interface EntryFormProps {
  styleContext: StyleContext;
  selectedMaterial: MaterialSelection;
  onCommitSuccess: () => void;
  editingRow: any | null; // 1. Accept row prop definitions safely from parent selection passes
}

export default function ConsumptionEntryForm({
  styleContext,
  selectedMaterial,
  onCommitSuccess,
  editingRow,
}: EntryFormProps) {
  const [form, setForm] = useState<FormInputs>({
    feature1: "",
    feature2: "",
    feature3: "",
    feature4: "",
    description: "",
    garmentColor: "",
    garmentSize: "",
    consumptionUnit: "",
    quantityPerGarment: "0",
    allowancePercentage: "0",
    finalItemUnit: "",
    supplierCode: "",
    unitPrice: "0",
  });

  const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // MANUAL CONSUMPTION ENTRY (2026-08-07): mirrors od_tpdt1.prg's "Calculate
  // Consumptions...? Yes|No" dialog. true (default) = the normal calculated
  // path below. false = Color/Size/Consumption Unit/Qty per Garment/%
  // Allowance are hidden and Total Consumption becomes a direct manual input.
  const [calculateConsumption, setCalculateConsumption] = useState<boolean>(true);

  const [prevMaterialId, setPrevMaterialId] = useState<string | null>(null);
  const currentMaterialId = `${selectedMaterial.stockCode}-${selectedMaterial.itemCode}`;

  if (currentMaterialId !== prevMaterialId) {
    setPrevMaterialId(currentMaterialId);
    setForm({
      feature1: "",
      feature2: "",
      feature3: "",
      feature4: "",
      description: "",
      garmentColor: "",
      garmentSize: "",
      consumptionUnit: "",
      quantityPerGarment: "0",
      allowancePercentage: "0",
      finalItemUnit: "",
      supplierCode: "",
      unitPrice: "0",
    });
    setCalculatedTotal(null);
    setCalculateConsumption(true);
    setErrorBanner(null);
  }

  // 2. IN-MEMORY EDITING PROP RESET ENGINE: Intercept and map properties directly into values before render pass
  const [prevRowKey, setPrevRowKey] = useState<string | null>(null);
  const currentRowKey = editingRow
    ? `${editingRow.stockCode}-${editingRow.itemCode}-${editingRow.feature1}-${editingRow.feature2}-${editingRow.feature3}-${editingRow.feature4}-${editingRow.color}-${editingRow.size}`
    : `NEW-${selectedMaterial.stockCode}-${selectedMaterial.itemCode}`;

  if (currentRowKey !== prevRowKey) {
    setPrevRowKey(currentRowKey);

    if (editingRow) {
      // If editing an existing row, load its saved database metrics directly into input states
      setForm({
        feature1: editingRow.feature1 || "",
        feature2: editingRow.feature2 || "",
        feature3: editingRow.feature3 || "",
        feature4: editingRow.feature4 || "",
        description: editingRow.description || "",
        garmentColor: editingRow.color || "",
        garmentSize: editingRow.size || "",
        consumptionUnit: editingRow.consumptionUnit || "",
        quantityPerGarment: String(editingRow.quantityPerGarment ?? 0),
        allowancePercentage: String(editingRow.percentageAllowance ?? 0),
        finalItemUnit: editingRow.itemUnit || "",
        supplierCode: editingRow.supplierCode || "",
        unitPrice: String(editingRow.unitPrice ?? 0),
      });
      setCalculatedTotal(editingRow.totalConsumption || 0);
      // MANUAL CONSUMPTION ENTRY: default to true (calculated mode) for legacy
      // rows saved before this field existed - matches the pre-existing
      // behavior of always showing the calculated fields.
      setCalculateConsumption(editingRow.calculateConsumption ?? true);
    } else {
      // Default to fresh blank models for clean additions
      setForm({
        feature1: "",
        feature2: "",
        feature3: "",
        feature4: "",
        description: "",
        garmentColor: "",
        garmentSize: "",
        consumptionUnit: "",
        quantityPerGarment: "0",
        allowancePercentage: "0",
        finalItemUnit: "",
        supplierCode: "",
        unitPrice: "0",
      });
      setCalculatedTotal(null);
      setCalculateConsumption(true);
    }
    setErrorBanner(null);
  }

  const { data: dimensionsData, isLoading: isDimensionsLoading } =
    useGetStyleDimensions({
      buyerCode: styleContext.buyerCode,
      order: styleContext.order,
      typeCode: styleContext.typeCode,
      styleCode: styleContext.styleCode,
    });

  // Safely derive lists with empty fallbacks to avoid map execution loop errors
  const availableColors = dimensionsData?.colors || [];
  const availableSizes = dimensionsData?.sizes || [];

  // 2. Fetch all system master unit profiles using your standard parameters payload
  const { data: unitsPageData, isLoading: isUnitsLoading } = useGetUnits({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });

  // Inside your ConsumptionEntryForm component block:
  const { data: suppliersData = [], isLoading: isSuppliersLoading } =
    useGetSuppliersLookup();
  const suppliersList = useMemo<SupplierServiceModel[]>(
    () => suppliersData || [],
    [suppliersData],
  );

  // Extract the item list array from your PaginationAPIModel structure safely via useMemo
  const unitsList = useMemo<Unit[]>(
    () => unitsPageData?.items || [],
    [unitsPageData],
  );

  const { data: featureMap, isLoading: isFeaturesLoading } =
    useGetDynamicFeatureHeaders({
      stockCode: selectedMaterial.stockCode,
      itemCode: selectedMaterial.itemCode,
    });

  const { mutateAsync: triggerCalculation, isPending: isCalculating } =
    useCalculateConsumptionMutation();
  const { mutateAsync: saveEntry, isPending: isSaving } =
    useSaveConsumptionEntryMutation();

  const handleInputChange = (field: keyof FormInputs, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRunCalculation = async () => {
    setErrorBanner(null);
    try {
      const result = await triggerCalculation({
        buyerCode: styleContext.buyerCode,
        order: styleContext.order,
        typeCode: styleContext.typeCode,
        styleCode: styleContext.styleCode,
        garmentColor: form.garmentColor || undefined,
        garmentSize: form.garmentSize || undefined,
        parentOrderUnit: styleContext.parentOrderUnit,
        consumptionUnit: form.consumptionUnit,
        finalItemUnit: form.finalItemUnit,
        quantityPerGarment: Number(form.quantityPerGarment) || 0,
        allowancePercentage: Number(form.allowancePercentage) || 0,
      });

      setCalculatedTotal(result);
    } catch (err: unknown) {
      console.log(err);
      setErrorBanner(
        "Calculation Aborted: Verify that the required unit conversion mapping factors exist inside your SQL tables.",
      );
    }
  };

  if (isFeaturesLoading || isUnitsLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}
      >
        <CircularProgress size={40} sx={{ mr: 2 }} />
        <Typography>
          Synchronizing structural parameters & master units...
        </Typography>
      </Box>
    );
  }

  if (isFeaturesLoading || isUnitsLoading || isDimensionsLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}
      >
        <CircularProgress size={40} sx={{ mr: 2 }} />
        <Typography>
          Synchronizing structural parameters, units, and garment targets...
        </Typography>
      </Box>
    );
  }

  if (
    isFeaturesLoading ||
    isUnitsLoading ||
    isDimensionsLoading ||
    isSuppliersLoading
  ) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}
      >
        <CircularProgress size={40} sx={{ mr: 2 }} />
        <Typography>
          Synchronizing structural parameters, units, and supplier lookups...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", mb: 2, color: "#ffffff" }}
        //sx={{ fontWeight: "bold", mb: 2, color: "#1a237e" }}
      >
        Selected: {selectedMaterial.description} ({selectedMaterial.stockCode}/
        {selectedMaterial.itemCode})
      </Typography>

      {errorBanner && (
        <Alert severity="error" sx={{ mb: 2, fontWeight: "bold" }}>
          {errorBanner}
        </Alert>
      )}

      <Card variant="outlined" sx={{ p: 3, backgroundColor: "#fff" }}>
        <Grid container spacing={2}>
          {editingRow &&
            (featureMap?.feature1 ||
              featureMap?.feature2 ||
              featureMap?.feature3 ||
              featureMap?.feature4) && (
              <Grid size={12}>
                <Alert severity="info" sx={{ py: 0.5 }}>
                  Feature values are locked while editing — start a new entry to
                  change the material variant.
                </Alert>
              </Grid>
            )}
          {/* Group 1: Dynamic Features Section */}
          {featureMap?.feature1 && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label={`Enter ${featureMap.feature1}`}
                size="small"
                fullWidth
                value={form.feature1}
                onChange={(e) =>
                  handleInputChange("feature1", e.target.value.toUpperCase())
                }
                disabled={!!editingRow}
                // 🚀 THE FIX: Enforces a maximum length constraint right inside the text input box!
                slotProps={{
                  htmlInput: {
                    maxLength: 4,
                    style: { textTransform: "uppercase" },
                  },
                }}
              />
            </Grid>
          )}
          {featureMap?.feature2 && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label={`Enter ${featureMap.feature2}`}
                size="small"
                fullWidth
                value={form.feature2}
                onChange={(e) =>
                  handleInputChange("feature2", e.target.value.toUpperCase())
                }
                disabled={!!editingRow}
                // 🚀 THE FIX: Enforces a maximum length constraint right inside the text input box!
                slotProps={{
                  htmlInput: {
                    maxLength: 4,
                    style: { textTransform: "uppercase" },
                  },
                }}
              />
            </Grid>
          )}
          {featureMap?.feature3 && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label={`Enter ${featureMap.feature3}`}
                size="small"
                fullWidth
                value={form.feature3}
                onChange={(e) =>
                  handleInputChange("feature3", e.target.value.toUpperCase())
                }
                disabled={!!editingRow}
                // 🚀 THE FIX: Enforces a maximum length constraint right inside the text input box!
                slotProps={{
                  htmlInput: {
                    maxLength: 4,
                    style: { textTransform: "uppercase" },
                  },
                }}
              />
            </Grid>
          )}
          {featureMap?.feature4 && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label={`Enter ${featureMap.feature4}`}
                size="small"
                fullWidth
                value={form.feature4}
                onChange={(e) =>
                  handleInputChange("feature4", e.target.value.toUpperCase())
                }
                disabled={!!editingRow}
                // 🚀 THE FIX: Enforces a maximum length constraint right inside the text input box!
                slotProps={{
                  htmlInput: {
                    maxLength: 4,
                    style: { textTransform: "uppercase" },
                  },
                }}
              />
            </Grid>
          )}

          {/* Human-readable description shown on the Supplier PO / budget lines - the raw
              Feature1-4 codes aren't meaningful to a supplier, so this is what should actually
              identify the material on a purchase order. */}
          <Grid size={12}>
            <TextField
              label="Description (shown on Supplier PO)"
              placeholder='e.g. "PIQUE 58-60in Knit Fabric"'
              size="small"
              fullWidth
              value={form.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </Grid>

          {/* MANUAL CONSUMPTION ENTRY (2026-08-07): mirrors od_tpdt1.prg's
              "Calculate Consumptions...? Yes|No" dialog. "Yes" keeps today's
              calculated flow (Group 2/3 fields below drive Total Consumption
              via Calculate Consumption). "No" hides those fields and lets the
              user type Total Consumption directly - for items whose
              consumption isn't proportional to garment quantity. */}
          <Grid size={12}>
            <FormLabel
              component="legend"
              sx={{ fontSize: "0.875rem", fontWeight: 600, mb: 0.5 }}
            >
              Calculate Consumptions?
            </FormLabel>
            <RadioGroup
              row
              value={calculateConsumption ? "Yes" : "No"}
              onChange={(e) => {
                setCalculateConsumption(e.target.value === "Yes");
                // Force a fresh Calculate / manual entry after switching modes
                // rather than silently carrying over a value computed under
                // the other mode.
                setCalculatedTotal(null);
              }}
            >
              <FormControlLabel
                value="Yes"
                control={<Radio size="small" color="primary" />}
                label="Yes - Calculate from Garment Qty"
              />
              <FormControlLabel
                value="No"
                control={<Radio size="small" color="secondary" />}
                label="No - Enter Total Consumption Manually"
              />
            </RadioGroup>
          </Grid>

          {/* Group 2: Garment Constraints Filter */}
          {/* Group 2: Garment Constraints Filter (Upgraded to type-safe Select dropdown menus) */}
          {calculateConsumption && (
          <>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Garment Colour Allocation"
              size="small"
              fullWidth
              value={form.garmentColor}
              onChange={(e) =>
                handleInputChange("garmentColor", e.target.value)
              }
            >
              {/* Explicit empty string option allows operators to apply consumption globally across all colours */}
              <MenuItem value="">
                <em>UNIVERSAL (Applies to all Fabric Colours)</em>
              </MenuItem>
              {availableColors.map((colorStr) => (
                <MenuItem key={colorStr} value={colorStr}>
                  {colorStr}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Garment Size Allocation"
              size="small"
              fullWidth
              value={form.garmentSize}
              onChange={(e) => handleInputChange("garmentSize", e.target.value)}
            >
              <MenuItem value="">
                <em>UNIVERSAL (Applies to all Dimensional Sizes)</em>
              </MenuItem>
              {availableSizes.map((sizeStr) => (
                <MenuItem key={sizeStr} value={sizeStr}>
                  {sizeStr}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Garment Colour Code (Optional)"
              placeholder="Blank applies to all colours"
              size="small"
              fullWidth
              value={form.garmentColor}
              onChange={(e) =>
                handleInputChange("garmentColor", e.target.value.toUpperCase())
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Garment Size Code (Optional)"
              placeholder="Blank applies to all sizes"
              size="small"
              fullWidth
              value={form.garmentSize}
              onChange={(e) =>
                handleInputChange("garmentSize", e.target.value.toUpperCase())
              }
            />
          </Grid> */}

          {/* Group 3: Quantitative Pro-Rata Multipliers */}
          <Grid size={{ xs: 12, sm: 4 }}>
            {/* FIXED: Dynamic Select Field populating from your live units list cache */}
            <TextField
              select
              label="Consumption Unit"
              size="small"
              fullWidth
              value={form.consumptionUnit}
              onChange={(e) =>
                handleInputChange("consumptionUnit", e.target.value)
              }
            >
              {unitsList.map((unit) => (
                <MenuItem key={unit.id} value={unit.code}>
                  {unit.code} ({unit.description})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Qty Per Garment"
              type="number"
              size="small"
              fullWidth
              value={form.quantityPerGarment}
              onChange={(e) =>
                handleInputChange("quantityPerGarment", e.target.value)
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Waste Allowance %"
              type="number"
              size="small"
              fullWidth
              value={form.allowancePercentage}
              onChange={(e) =>
                handleInputChange("allowancePercentage", e.target.value)
              }
            />
          </Grid>
          </>
          )}

          {/* MANUAL CONSUMPTION ENTRY: legacy's "No" branch - Color/Size/
              Consumption Unit/Qty per Garment/% Allowance are not applicable
              (blanked server-side too, see MaterialConsumptionService), and
              Total Consumption is entered directly instead of computed. */}
          {!calculateConsumption && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Total Consumption (Manual Entry)"
              type="number"
              size="small"
              fullWidth
              required
              value={calculatedTotal ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setCalculatedTotal(val === "" ? null : Number(val));
              }}
              helperText={`Enter the total quantity required, in ${
                form.finalItemUnit || "the selected purchase unit"
              }.`}
            />
          </Grid>
          )}

          {/* Group 4: Purchasing Metrics and Logistics */}
          {/* FIXED: Dynamic Purchase Unit Select Field populating from your live units list cache */}
          {/* <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              label="Final Purchase Unit"
              size="small"
              fullWidth
              value={form.finalItemUnit}
              onChange={(e) =>
                handleInputChange("finalItemUnit", e.target.value)
              }
            >
              {unitsList.map((unit) => (
                <MenuItem key={unit.id} value={unit.code}>
                  {unit.code} ({unit.description})
                </MenuItem>
              ))}
            </TextField>
          </Grid> */}

          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              options={unitsList}
              // Displays the code alongside the name nicely for operators (e.g. "1001 (Millers Fabrics)")
              getOptionLabel={(option) =>
                option.code ? `${option.code} (${option.description})` : ""
              }
              // Cross-references the active form selection code string by finding the matching object value
              value={
                unitsList.find((s) => String(s.code) === form.finalItemUnit) ||
                null
              }
              // Updates your master form input state cleanly upon user selection choice updates
              onChange={(_, val) =>
                handleInputChange("finalItemUnit", val ? String(val.code) : "")
              }
              isOptionEqualToValue={(option, value) =>
                option.code === value?.code
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Final Purchase Unit"
                  size="small"
                  fullWidth
                  required
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              options={suppliersList}
              // Displays the code alongside the name nicely for operators (e.g. "1001 (Millers Fabrics)")
              getOptionLabel={(option) => (option.name ? `${option.name}` : "")}
              // Cross-references the active form selection code string by finding the matching object value
              value={
                suppliersList.find(
                  (s: SupplierServiceModel) =>
                    String(s.supplierCode) === form.supplierCode,
                ) || null
              }
              // Updates your master form input state cleanly upon user selection choice updates
              onChange={(_, val) =>
                handleInputChange(
                  "supplierCode",
                  val ? String(val.supplierCode) : "",
                )
              }
              isOptionEqualToValue={(option, value) =>
                option.supplierCode === value?.supplierCode
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Supplier"
                  size="small"
                  fullWidth
                  required
                />
              )}
            />
          </Grid>

          {/* <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Supplier Code"
              size="small"
              fullWidth
              value={form.supplierCode}
              onChange={(e) =>
                handleInputChange("supplierCode", e.target.value.toUpperCase())
              }
            />
          </Grid> */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Unit Purchase Price"
              type="number"
              size="small"
              fullWidth
              value={form.unitPrice}
              onChange={(e) => handleInputChange("unitPrice", e.target.value)}
            />
          </Grid>
        </Grid>

        {/* Action Panel Actions Block */}
        <Box
          sx={{
            borderTop: "1px solid #dee2e6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 3,
            paddingTop: 2,
          }}
        >
          {calculateConsumption ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={
                isCalculating ? <CircularProgress size={20} /> : <CalculateIcon />
              }
              disabled={
                isCalculating || !form.consumptionUnit || !form.finalItemUnit
              }
              onClick={handleRunCalculation}
            >
              Calculate Consumption
            </Button>
          ) : (
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontStyle: "italic" }}
            >
              Manual entry mode - Total Consumption entered directly above.
            </Typography>
          )}

          {calculatedTotal !== null && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#2e7d32",
                fontFamily: "monospace",
              }}
            >
              Total Requirement: {calculatedTotal.toLocaleString()}{" "}
              {form.finalItemUnit}
            </Typography>
          )}

          <Button
            variant="contained"
            color="success"
            startIcon={
              isSaving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <AddShoppingCartIcon />
              )
            }
            disabled={
              // Calculated mode: unchanged - must have run Calculate at least
              // once. Manual mode: must have entered a positive Total
              // Consumption (mirrors od_tpdt1.prg's "valid m_tot_con > 0").
              (calculateConsumption
                ? calculatedTotal === null
                : !(calculatedTotal !== null && calculatedTotal > 0)) ||
              isSaving
            }
            onClick={async () => {
              // console.log("ready to save form :", form.feature1);
              // console.log("ready to save form :", form.feature2);
              const payload = {
                buyerCode: styleContext.buyerCode,
                order: styleContext.order,
                typeCode: styleContext.typeCode,
                styleCode: styleContext.styleCode,
                // MANUAL CONSUMPTION ENTRY: Color/Size/Consumption Unit/Qty per
                // Garment/% Allowance are not applicable in manual mode (see
                // od_tpdt1.prg's "No" branch) - send blank/zero regardless of
                // whatever the (hidden) form fields still hold, rather than
                // relying solely on the backend to blank them.
                color: calculateConsumption ? form.garmentColor || "" : "",
                size: calculateConsumption ? form.garmentSize || "" : "",
                stockCode: selectedMaterial.stockCode,
                itemCode: selectedMaterial.itemCode,
                feature1: form.feature1,
                feature2: form.feature2,
                feature3: form.feature3,
                feature4: form.feature4,
                description: form.description,
                consumptionUnit: calculateConsumption
                  ? form.consumptionUnit
                  : "",
                quantityPerGarment: calculateConsumption
                  ? Number(form.quantityPerGarment) || 0
                  : 0,
                percentageAllowance: calculateConsumption
                  ? Number(form.allowancePercentage) || 0
                  : 0,
                itemUnit: form.finalItemUnit,
                totalConsumption: calculatedTotal || 0,
                supplierCode: form.supplierCode,
                unitPrice: Number(form.unitPrice) || 0,
                calculateConsumption,

                // FIXED: Dynamically pulls and passes the explicit currency code selected in the master header dropdown!
                currency: styleContext.currencyCode,

                // Only set when editing an EXISTING row - tells the backend what
                // Colour/Size this line was saved under originally, so it can
                // clean up that old row if the merchandiser reselected a
                // different Colour/Size above (see SaveMaterialConsumptionEntryAsync's
                // Colour/Size-reselect fix). Left undefined for a brand-new entry.
                originalColor: editingRow ? editingRow.color || "" : undefined,
                originalSize: editingRow ? editingRow.size || "" : undefined,
              };

              const toastId = toast.loading(
                "Saving material consumption entry...",
              );
              try {
                const success = await saveEntry(payload);

                if (!success) {
                  // Blocked: a supplier PO has already been raised against the
                  // ORIGINAL Colour/Size line this row is being moved away from
                  // (see SaveMaterialConsumptionEntryAsync). Nothing was saved.
                  toast.update(toastId, {
                    render:
                      "🛑 Save blocked: a supplier PO has already been raised against the original Colour/Size line. Revert Colour/Size to save changes, or contact your Merchandising Manager.",
                    type: "error",
                    isLoading: false,
                    autoClose: 6000,
                    closeButton: true,
                  });
                  return;
                }

                toast.update(toastId, {
                  render: "✓ Material item entry saved successfully!",
                  type: "success",
                  isLoading: false,
                  autoClose: 4000,
                  closeButton: true,
                });
                onCommitSuccess();

                // If this was a brand-new entry (not editing an existing
                // row), reset the form back to blank for the SAME material
                // so another new line (e.g. a different size/color of the
                // same item) can be entered right away, without having to
                // deselect and reselect the material category first. When
                // editing an existing row, the parent already clears
                // editingRow on success, which naturally resets the form via
                // the currentRowKey effect above - no extra reset needed here.
                if (!editingRow) {
                  setForm({
                    feature1: "",
                    feature2: "",
                    feature3: "",
                    feature4: "",
                    description: "",
                    garmentColor: "",
                    garmentSize: "",
                    consumptionUnit: "",
                    quantityPerGarment: "0",
                    allowancePercentage: "0",
                    finalItemUnit: "",
                    supplierCode: "",
                    unitPrice: "0",
                  });
                  setCalculatedTotal(null);
                  setCalculateConsumption(true);
                  setErrorBanner(null);
                }
              } catch (err: unknown) {
                // saveEntry's mutationFn (useSaveConsumptionEntryMutation)
                // rejects with the AppError shape produced by axiosClient's
                // response interceptor - includes the real server message
                // (e.g. "Style already approved on {date}...") rather than
                // the previous hardcoded generic text, which showed the same
                // unhelpful line regardless of what actually went wrong
                // (including the 403 approval-lock case).
                const appError = err as AppError;
                const serverMessage =
                  appError && typeof appError.message === "string"
                    ? appError.message
                    : null;

                toast.update(toastId, {
                  render: serverMessage
                    ? `🛑 ${serverMessage}`
                    : "🛑 Failed to save material consumption entry. Verify database connectivity rules.",
                  type: "error",
                  isLoading: false,
                  autoClose: 6000,
                  closeButton: true,
                });
              }
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
