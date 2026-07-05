import { useState, useMemo, useEffect } from "react";
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
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CalculateIcon from "@mui/icons-material/Calculate";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import type {
  StyleContext,
  MaterialSelection,
  FormInputs,
} from "./material-consumption.types";

// Import your custom hooks from your services slice
import {
  useGetDynamicFeatureHeadersQuery,
  useLazyCalculateConsumptionQuery,
  useSaveConsumptionEntryMutation,
  // 1. ADDED: Import your live units fetching hook from your service file
  useGetAllUnitsQuery,
  useGetStyleDimensionsQuery,
  useGetSuppliersLookupQuery,
} from "../../services/material-consumption.services";
import type { SupplierServiceModel } from "../../tanstack-hooks/interfaces";

// Define the exact C# service contract model layout locally to satisfy strict typings
interface UnitServiceModel {
  id: number;
  code: string;
  description: string;
}

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

  const [prevMaterialId, setPrevMaterialId] = useState<string | null>(null);
  const currentMaterialId = `${selectedMaterial.stockCode}-${selectedMaterial.itemCode}`;

  if (currentMaterialId !== prevMaterialId) {
    setPrevMaterialId(currentMaterialId);
    setForm({
      feature1: "",
      feature2: "",
      feature3: "",
      feature4: "",
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
        garmentColor: editingRow.color || "",
        garmentSize: editingRow.size || "",
        consumptionUnit: editingRow.consumptionUnit || "",
        quantityPerGarment: String(editingRow.quantityPerGarment ?? 0),
        allowancePercentage: String(editingRow.percentageAllowance ?? 0),
        finalItemUnit: editingRow.itemUnit || "",
        supplierCode: editingRow.supplierCode || "",
        unitPrice: "0", // Can be expanded dynamically based on pricing table records
      });
      setCalculatedTotal(editingRow.totalConsumption || 0);
    } else {
      // Default to fresh blank models for clean additions
      setForm({
        feature1: "",
        feature2: "",
        feature3: "",
        feature4: "",
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
    }
    setErrorBanner(null);
  }

  const { data: dimensionsData, isLoading: isDimensionsLoading } =
    useGetStyleDimensionsQuery({
      buyerCode: styleContext.buyerCode,
      order: styleContext.order,
      typeCode: styleContext.typeCode,
      styleCode: styleContext.styleCode,
    });

  // Safely derive lists with empty fallbacks to avoid map execution loop errors
  const availableColors = dimensionsData?.colors || [];
  const availableSizes = dimensionsData?.sizes || [];

  // 2. Fetch all system master unit profiles using your standard parameters payload
  const { data: unitsPageData, isLoading: isUnitsLoading } =
    useGetAllUnitsQuery({
      pageIndex: 0,
      pageSize: 999,
      sortColumn: "code",
      sortOrder: "asc",
      filterColumn: null,
      filterQuery: null,
    });

  useEffect(() => {
    console.log("style color size details----->>>", availableColors);
    console.log("style color size details----->>>", availableSizes);
  });

  // Inside your ConsumptionEntryForm component block:
  const { data: suppliersData = [], isLoading: isSuppliersLoading } =
    useGetSuppliersLookupQuery();
  const suppliersList = useMemo<SupplierServiceModel[]>(
    () => suppliersData || [],
    [suppliersData],
  );

  // Extract the item list array from your PaginationAPIModel structure safely via useMemo
  const unitsList = useMemo<UnitServiceModel[]>(
    () => unitsPageData?.items || [],
    [unitsPageData],
  );

  const { data: featureMap, isLoading: isFeaturesLoading } =
    useGetDynamicFeatureHeadersQuery({
      stockCode: selectedMaterial.stockCode,
      itemCode: selectedMaterial.itemCode,
    });

  useEffect(() => {
    console.log("suppliers : ", suppliersData);
    console.log("suppliers list: ", suppliersList);
    console.log("feature map list: ", featureMap);
  });

  const [triggerCalculation, { isFetching: isCalculating }] =
    useLazyCalculateConsumptionQuery();
  const [saveEntry, { isLoading: isSaving }] =
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
      }).unwrap();

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
        sx={{ fontWeight: "bold", mb: 2, color: "#1a237e" }}
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

          {/* Group 2: Garment Constraints Filter */}
          {/* Group 2: Garment Constraints Filter (Upgraded to type-safe Select dropdown menus) */}
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
                unitsList.find(
                  (s: UnitServiceModel) =>
                    String(s.code) === form.finalItemUnit,
                ) || null
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
              getOptionLabel={(option) =>
                option.name ? `${option.supplierCode} (${option.name})` : ""
              }
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
          <Button
            variant="outlined"
            color="primary"
            startIcon={
              isCalculating ? <CircularProgress size={20} /> : <CalculateIcon />
            }
            disabled={
              isCalculating || !form.consumptionUnit || !form.finalItemUnit
            }
            onClick={handleRunCalculation}
          >
            Run Consumption Math
          </Button>

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
            disabled={calculatedTotal === null || isSaving}
            onClick={async () => {
              try {
                console.log("ready to save form :", form.feature1);
                console.log("ready to save form :", form.feature2);
                const payload = {
                  buyerCode: styleContext.buyerCode,
                  order: styleContext.order,
                  typeCode: styleContext.typeCode,
                  styleCode: styleContext.styleCode,
                  color: form.garmentColor || "",
                  size: form.garmentSize || "",
                  stockCode: selectedMaterial.stockCode,
                  itemCode: selectedMaterial.itemCode,
                  feature1: form.feature1,
                  feature2: form.feature2,
                  feature3: form.feature3,
                  feature4: form.feature4,
                  consumptionUnit: form.consumptionUnit,
                  quantityPerGarment: Number(form.quantityPerGarment) || 0,
                  percentageAllowance: Number(form.allowancePercentage) || 0,
                  itemUnit: form.finalItemUnit,
                  totalConsumption: calculatedTotal || 0,
                  supplierCode: form.supplierCode,
                  unitPrice: Number(form.unitPrice) || 0,

                  // FIXED: Dynamically pulls and passes the explicit currency code selected in the master header dropdown!
                  currency: styleContext.currencyCode,
                };

                await saveEntry(payload).unwrap();
                alert(
                  "Material ledger entry saved and synchronized with SQL Server successfully!",
                );
                onCommitSuccess();
              } catch (err: unknown) {
                console.log(err);
                alert(
                  "Failed to save material consumption entry. Verify database connectivity rules.",
                );
              }
            }}
          >
            {isSaving ? "Saving..." : "Commit Entry"}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}

// import { useState, useEffect, useMemo } from "react";
// import {
//   Box,
//   Card,
//   Typography,
//   TextField,
//   Button,
//   Alert,
//   CircularProgress,
//   MenuItem,
//   Autocomplete,
// } from "@mui/material";
// import Grid from "@mui/material/Grid";
// import CalculateIcon from "@mui/icons-material/Calculate";
// import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
// import type {
//   StyleContext,
//   MaterialSelection,
//   FormInputs,
// } from "./material-consumption.types";

// // Import your custom data-fetching hooks from your RTK API slice
// import {
//   useGetAllUnitsQuery,
//   useGetDynamicFeatureHeadersQuery,
//   useLazyCalculateConsumptionQuery,
//   type UnitServiceModel,
// } from "../../services/material-consumption.services";

// // At the top of consumption-entry-form.component.tsx, import the mutation hook:
// import {
//   useSaveConsumptionEntryMutation, // <-- Import the new mutation hook
// } from "../../services/material-consumption.services";

// interface EntryFormProps {
//   styleContext: StyleContext;
//   selectedMaterial: MaterialSelection;
//   onCommitSuccess: () => void; // <-- ADD THIS EXACT TYPE SPECIFICATION LINE HERE
// }

// export default function ConsumptionEntryForm({
//   styleContext,
//   selectedMaterial,
//   onCommitSuccess,
// }: EntryFormProps) {
//   // 1. Core State Control using our strict FormInputs interface contract
//   const [form, setForm] = useState<FormInputs>({
//     feature1: "",
//     feature2: "",
//     feature3: "",
//     feature4: "",
//     garmentColor: "",
//     garmentSize: "",
//     consumptionUnit: "",
//     quantityPerGarment: "0",
//     allowancePercentage: "0",
//     finalItemUnit: "",
//     supplierCode: "",
//     unitPrice: "0",
//   });

//   const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null);
//   const [errorBanner, setErrorBanner] = useState<string | null>(null);

//   // ... Inside your ConsumptionEntryForm component function block:
//   const [saveEntry, { isLoading: isSaving }] =
//     useSaveConsumptionEntryMutation();

//   // 1. Declare a state flag to track the last material ID seen during rendering
//   const [prevMaterialId, setPrevMaterialId] = useState<string | null>(null);

//   // 2. Generate a clean compound comparison string
//   const currentMaterialId = `${selectedMaterial.stockCode}-${selectedMaterial.itemCode}`;

//   // 3. IN-MEMORY RESET GUARD: Synchronously updates layout data before rendering occurs
//   if (currentMaterialId !== prevMaterialId) {
//     setPrevMaterialId(currentMaterialId);

//     // Reset all form metrics back to blank configurations instantly
//     setForm({
//       feature1: "",
//       feature2: "",
//       feature3: "",
//       feature4: "",
//       garmentColor: "",
//       garmentSize: "",
//       consumptionUnit: "",
//       quantityPerGarment: "0",
//       allowancePercentage: "0",
//       finalItemUnit: "",
//       supplierCode: "",
//       unitPrice: "0",
//     });
//     setCalculatedTotal(null);
//     setErrorBanner(null);
//   }

//   // const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null);
//   // const [errorBanner, setErrorBanner] = useState<string | null>(null);

//   // 2. Fetch the 4 dynamic layout labels from your C# endpoint via RTK Query
//   const { data: featureMap, isLoading: isFeaturesLoading } =
//     useGetDynamicFeatureHeadersQuery({
//       stockCode: selectedMaterial.stockCode,
//       itemCode: selectedMaterial.itemCode,
//     });

//   // const { data: unitConversions } = useGetAllUnitConversionsQuery();

//   // Fetch Buyers Registry
//   const { data: unitsPageData, isLoading: isUnitsLoading } =
//     useGetAllUnitsQuery({
//       pageIndex: 0,
//       pageSize: 999,
//       sortColumn: "name",
//       sortOrder: "asc",
//       filterColumn: null,
//       filterQuery: null,
//     });

//   const units = useMemo<UnitServiceModel[]>(
//     () => unitsPageData?.items || [],
//     [unitsPageData],
//   );

//   useEffect(() => {
//     console.log("units : ", unitsPageData?.items || []);
//   }, [unitsPageData?.items]);

//   // 3. Mount the lazy calculation hook to run our formulas on command
//   const [triggerCalculation, { isFetching: isCalculating }] =
//     useLazyCalculateConsumptionQuery();

//   const handleInputChange = (field: keyof FormInputs, value: string) => {
//     setForm((prev) => ({ ...prev, [field]: value }));
//   };

//   // --- Dynamic Clipper Math Execution Trigger ---
//   const handleRunCalculation = async () => {
//     setErrorBanner(null);
//     try {
//       const result = await triggerCalculation({
//         buyerCode: styleContext.buyerCode,
//         order: styleContext.order,
//         typeCode: styleContext.typeCode,
//         styleCode: styleContext.styleCode,
//         garmentColor: form.garmentColor || undefined,
//         garmentSize: form.garmentSize || undefined,
//         parentOrderUnit: styleContext.parentOrderUnit,
//         consumptionUnit: form.consumptionUnit,
//         finalItemUnit: form.finalItemUnit,
//         quantityPerGarment: Number(form.quantityPerGarment) || 0,
//         allowancePercentage: Number(form.allowancePercentage) || 0,
//       }).unwrap();

//       setCalculatedTotal(result);
//     } catch (err: unknown) {
//       setErrorBanner(
//         "Calculation Aborted: Verify that the required unit conversion mapping factor rules exist inside your SQL tables.",
//       );
//     }
//   };

//   if (isFeaturesLoading) {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           height: "300px",
//         }}
//       >
//         <CircularProgress size={40} sx={{ mr: 2 }} />
//         <Typography>Resolving structural data parameters...</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box>
//       <Typography
//         variant="h6"
//         sx={{ fontWeight: "bold", mb: 2, color: "#1a237e" }}
//       >
//         Selected: {selectedMaterial.description} ({selectedMaterial.stockCode}/
//         {selectedMaterial.itemCode})
//       </Typography>

//       {errorBanner && (
//         <Alert severity="error" sx={{ mb: 2, fontWeight: "bold" }}>
//           {errorBanner}
//         </Alert>
//       )}

//       <Card variant="outlined" sx={{ p: 3, backgroundColor: "#fff" }}>
//         <Grid container spacing={2}>
//           {/* Group 1: Dynamic Features Section (Renders ONLY if a custom metadata label exists in DB) */}
//           {featureMap?.feature1 && (
//             <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//               <TextField
//                 label={`Enter ${featureMap.feature1}`}
//                 size="small"
//                 fullWidth
//                 value={form.feature1}
//                 onChange={(e) =>
//                   handleInputChange("feature1", e.target.value.toUpperCase())
//                 }
//               />
//             </Grid>
//           )}
//           {featureMap?.feature2 && (
//             <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//               <TextField
//                 label={`Enter ${featureMap.feature2}`}
//                 size="small"
//                 fullWidth
//                 value={form.feature2}
//                 onChange={(e) =>
//                   handleInputChange("feature2", e.target.value.toUpperCase())
//                 }
//               />
//             </Grid>
//           )}
//           {featureMap?.feature3 && (
//             <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//               <TextField
//                 label={`Enter ${featureMap.feature3}`}
//                 size="small"
//                 fullWidth
//                 value={form.feature3}
//                 onChange={(e) =>
//                   handleInputChange("feature3", e.target.value.toUpperCase())
//                 }
//               />
//             </Grid>
//           )}
//           {featureMap?.feature4 && (
//             <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//               <TextField
//                 label={`Enter ${featureMap.feature4}`}
//                 size="small"
//                 fullWidth
//                 value={form.feature4}
//                 onChange={(e) =>
//                   handleInputChange("feature4", e.target.value.toUpperCase())
//                 }
//               />
//             </Grid>
//           )}

//           {/* Group 2: Garment Constraints Filter (Leave blank for universal style allocations) */}
//           <Grid size={{ xs: 12, sm: 6 }}>
//             <TextField
//               label="Garment Colour Code (Optional)"
//               placeholder="Blank applies to all colours"
//               size="small"
//               fullWidth
//               value={form.garmentColor}
//               onChange={(e) =>
//                 handleInputChange("garmentColor", e.target.value.toUpperCase())
//               }
//             />
//           </Grid>
//           <Grid size={{ xs: 12, sm: 6 }}>
//             <TextField
//               label="Garment Size Code (Optional)"
//               placeholder="Blank applies to all sizes"
//               size="small"
//               fullWidth
//               value={form.garmentSize}
//               onChange={(e) =>
//                 handleInputChange("garmentSize", e.target.value.toUpperCase())
//               }
//             />
//           </Grid>

//           {/* Group 3: Quantitative Pro-Rata Multipliers */}
//           <Grid size={{ xs: 12, sm: 4 }}>
//             <TextField
//               select
//               label="Consumption Unit"
//               size="small"
//               fullWidth
//               // value={form.consumptionUnit}
//               value={form.consumptionUnit}
//               onChange={(e) =>
//                 handleInputChange("consumptionUnit", e.target.value)
//               }
//             >
//               {units &&
//                 units.map((unit) => {
//                   return (
//                     <MenuItem value={unit.code}>{unit.description}</MenuItem>
//                   );
//                 })}
//               <MenuItem value="PCS">PCS (Pieces)</MenuItem>
//               <MenuItem value="YDS">YDS (Yards)</MenuItem>
//               <MenuItem value="DZ">DZ (Dozens)</MenuItem>
//             </TextField>

//           </Grid>
//           <Grid size={{ xs: 12, sm: 4 }}>
//             <TextField
//               label="Qty Per Garment"
//               type="number"
//               size="small"
//               fullWidth
//               value={form.quantityPerGarment}
//               onChange={(e) =>
//                 handleInputChange("quantityPerGarment", e.target.value)
//               }
//             />
//           </Grid>
//           <Grid size={{ xs: 12, sm: 4 }}>
//             <TextField
//               label="Waste Allowance %"
//               type="number"
//               size="small"
//               fullWidth
//               value={form.allowancePercentage}
//               onChange={(e) =>
//                 handleInputChange("allowancePercentage", e.target.value)
//               }
//             />
//           </Grid>

//           {/* Group 4: Purchasing Metrics and Logistics */}
//           <Grid size={{ xs: 12, sm: 4 }}>
//             <TextField
//               select
//               label="Final Purchase Unit"
//               size="small"
//               fullWidth
//               value={form.finalItemUnit}
//               onChange={(e) =>
//                 handleInputChange("finalItemUnit", e.target.value)
//               }
//             >
//               <MenuItem value="PCS">PCS (Pieces)</MenuItem>
//               <MenuItem value="GRS">GRS (Gross Box)</MenuItem>
//               <MenuItem value="DZ">DZ (Dozens)</MenuItem>
//             </TextField>
//           </Grid>
//           <Grid size={{ xs: 12, sm: 4 }}>
//             <TextField
//               label="Supplier Code"
//               size="small"
//               fullWidth
//               value={form.supplierCode}
//               onChange={(e) =>
//                 handleInputChange("supplierCode", e.target.value.toUpperCase())
//               }
//             />
//           </Grid>
//           <Grid size={{ xs: 12, sm: 4 }}>
//             <TextField
//               label="Unit Purchase Price"
//               type="number"
//               size="small"
//               fullWidth
//               value={form.unitPrice}
//               onChange={(e) => handleInputChange("unitPrice", e.target.value)}
//             />
//           </Grid>
//         </Grid>

//         {/* Action Panel Actions Block */}
//         <Box
//           sx={{
//             display: "flex",
//             borderTop: "1px solid #dee2e6",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginTop: 3,
//             padding: 2,
//           }}
//         >
//           <Button
//             variant="outlined"
//             color="primary"
//             startIcon={
//               isCalculating ? <CircularProgress size={20} /> : <CalculateIcon />
//             }
//             disabled={
//               isCalculating || !form.consumptionUnit || !form.finalItemUnit
//             }
//             onClick={handleRunCalculation}
//           >
//             Run Consumption Math
//           </Button>

//           {/* Display Calculated Results instantly on screen layout */}
//           {calculatedTotal !== null && (
//             <Typography
//               variant="h6"
//               sx={{
//                 fontWeight: "bold",
//                 color: "#2e7d32",
//                 fontFamily: "monospace",
//               }}
//             >
//               Total Requirement: {calculatedTotal.toLocaleString()}{" "}
//               {form.finalItemUnit}
//             </Typography>
//           )}

//           <Button
//             variant="contained"
//             color="success"
//             startIcon={
//               isSaving ? (
//                 <CircularProgress size={20} color="inherit" />
//               ) : (
//                 <AddShoppingCartIcon />
//               )
//             }
//             disabled={calculatedTotal === null || isSaving}
//             onClick={async () => {
//               try {
//                 // Build the exact vertical payload structure expected by your C# API Controller
//                 const payload = {
//                   buyerCode: styleContext.buyerCode,
//                   order: styleContext.order,
//                   typeCode: styleContext.typeCode,
//                   styleCode: styleContext.styleCode,
//                   color: form.garmentColor || "",
//                   size: form.garmentSize || "",
//                   stockCode: selectedMaterial.stockCode,
//                   itemCode: selectedMaterial.itemCode,
//                   feature1: form.feature1,
//                   feature2: form.feature2,
//                   feature3: form.feature3,
//                   feature4: form.feature4,
//                   consumptionUnit: form.consumptionUnit,
//                   quantityPerGarment: Number(form.quantityPerGarment) || 0,
//                   percentageAllowance: Number(form.allowancePercentage) || 0,
//                   itemUnit: form.finalItemUnit,
//                   totalConsumption: calculatedTotal || 0,
//                   supplierCode: form.supplierCode,
//                   unitPrice: Number(form.unitPrice) || 0,
//                 };

//                 console.log(
//                   "Transmitting transactional ledger entry payload to C# server...",
//                   payload,
//                 );

//                 // Execute the database insert mutation
//                 await saveEntry(payload).unwrap();

//                 alert(
//                   "Material ledger entry saved and synchronized with SQL Server successfully!",
//                 );
//                 onCommitSuccess(); // Triggers the parent hook refetch to refresh the bottom grid instantly
//               } catch (err) {
//                 alert(
//                   "Failed to save material consumption entry. Verify database connectivity rules.",
//                 );
//               }
//             }}
//           >
//             {isSaving ? "Saving..." : "Commit Entry"}
//           </Button>
//         </Box>
//       </Card>
//     </Box>
//   );
// }
