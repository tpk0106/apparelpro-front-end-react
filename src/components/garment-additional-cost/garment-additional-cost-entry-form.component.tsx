import { useState, useMemo } from "react";
import {
  Box,
  TextField,
  Button,
  Alert,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import type { SelectedScopeContext } from "../material-consumption/material-consumption.types";
import type { MaterialSelection } from "../material-consumption/material-consumption.types";
import { useGetDynamicFeatureHeaders } from "../../tanstack-hooks/material-consumption-entry.hooks";
import {
  useGetAdditionalCosts,
  useGetBasis,
  useGetCurrenciesQuery,
  useGetStyleDimensions,
  useGetUnits,
} from "../../tanstack-hooks/custom-hooks";
import { useSaveGarmentAdditionalCostMutation } from "../../tanstack-hooks/garment-additional-cost.hooks";
import type {
  GarmentAdditionalCostRow,
  SaveGarmentAdditionalCostPayload,
} from "./garment-additional-cost.types";
import { mockupColors } from "./garment-additional-cost.types";

interface FormState {
  additionalCostCode: string;
  feature1: string;
  feature2: string;
  feature3: string;
  feature4: string;
  description: string;
  color: string;
  size: string;
  storeCode: string;
  currency: string;
  unit: string;
  quantity: string;
  cost: string;
  isCostPerGarment: boolean;
  isSemiFinishedGarment: boolean;
}

const blankForm = (defaultCurrency: string): FormState => ({
  additionalCostCode: "",
  feature1: "",
  feature2: "",
  feature3: "",
  feature4: "",
  description: "",
  color: "",
  size: "",
  storeCode: "",
  currency: defaultCurrency,
  unit: "",
  quantity: "1",
  cost: "0",
  isCostPerGarment: true,
  isSemiFinishedGarment: false,
});

// Dark-input styling scoped to this form only - see garment-additional-cost.component.tsx's
// header comment for why this doesn't touch the shared theme.
const darkFieldSx = {
  "& .MuiInputBase-root": {
    color: mockupColors.text,
    backgroundColor: mockupColors.input,
  },
  "& .MuiInputLabel-root": { color: mockupColors.muted },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: mockupColors.border },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: mockupColors.accent,
  },
};

interface EntryFormProps {
  styleContext: SelectedScopeContext;
  selectedMaterial: MaterialSelection;
  editingRow: GarmentAdditionalCostRow | null;
  onCommitSuccess: () => void;
  onCancelEdit: () => void;
}

export default function GarmentAdditionalCostEntryForm({
  styleContext,
  selectedMaterial,
  editingRow,
  onCommitSuccess,
  onCancelEdit,
}: EntryFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    blankForm(styleContext.currencyCode),
  );
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Reset/populate the form whenever the selected item or the row being edited changes -
  // same pattern as ConsumptionEntryForm's prevMaterialId/prevRowKey tracking.
  const [prevKey, setPrevKey] = useState<string | null>(null);
  const currentKey = editingRow
    ? `EDIT-${editingRow.additionalCostCode}-${editingRow.itemCode}`
    : `NEW-${selectedMaterial.stockCode}-${selectedMaterial.itemCode}`;

  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    if (editingRow) {
      setForm({
        additionalCostCode: editingRow.additionalCostCode,
        feature1: editingRow.feature1 || "",
        feature2: editingRow.feature2 || "",
        feature3: editingRow.feature3 || "",
        feature4: editingRow.feature4 || "",
        description: editingRow.description || "",
        color: editingRow.color || "",
        size: editingRow.size || "",
        storeCode: editingRow.storeCode || "",
        currency: editingRow.currency || styleContext.currencyCode,
        unit: editingRow.unit || "",
        quantity: String(editingRow.quantity ?? 0),
        cost: String(editingRow.cost ?? 0),
        isCostPerGarment: editingRow.isCostPerGarment,
        isSemiFinishedGarment: editingRow.isSemiFinishedGarment,
      });
    } else {
      setForm(blankForm(styleContext.currencyCode));
    }
    setErrorBanner(null);
  }

  const { data: additionalCostPageData } = useGetAdditionalCosts({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const additionalCostOptions = additionalCostPageData?.items || [];

  const { data: featureMap } = useGetDynamicFeatureHeaders({
    stockCode: selectedMaterial.stockCode,
    itemCode: selectedMaterial.itemCode,
  });

  const { data: dimensionsData } = useGetStyleDimensions({
    buyerCode: styleContext.buyerCode,
    order: styleContext.order,
    typeCode: styleContext.typeCode,
    styleCode: styleContext.styleCode,
  });
  const availableColors = dimensionsData?.colors || [];
  const availableSizes = dimensionsData?.sizes || [];

  const { data: basisPageData } = useGetBasis({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const basisOptions = basisPageData?.items || [];

  const { data: currencyPageData } = useGetCurrenciesQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const currencyOptions = currencyPageData?.items || [];

  const { data: unitPageData } = useGetUnits({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const unitOptions = unitPageData?.items || [];

  const { mutateAsync: saveEntry, isPending: isSaving } =
    useSaveGarmentAdditionalCostMutation();

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Read-only preview only - the real Total Value is computed server-side against the
  // live targeted-garment count (see GarmentAdditionalCostService.SaveGarmentAdditionalCostAsync),
  // this is just so the user isn't staring at a blank field while filling the form in.
  const previewValue = useMemo(() => {
    const cost = Number(form.cost) || 0;
    return form.isCostPerGarment
      ? `${cost.toFixed(4)} × targeted garment qty`
      : `${cost.toFixed(4)} (lump sum)`;
  }, [form.cost, form.isCostPerGarment]);

  const handleSave = async () => {
    setErrorBanner(null);

    if (!form.additionalCostCode) {
      setErrorBanner("Additional Cost Category is required.");
      return;
    }
    if (!form.storeCode) {
      setErrorBanner("Basis is required.");
      return;
    }
    if (!form.currency) {
      setErrorBanner("Currency is required.");
      return;
    }
    if (!form.unit) {
      setErrorBanner("Unit is required.");
      return;
    }
    if (Number(form.quantity) <= 0) {
      setErrorBanner("Quantity per Garment must be greater than zero.");
      return;
    }
    if (Number(form.cost) <= 0) {
      setErrorBanner("Cost must be greater than zero.");
      return;
    }

    const payload: SaveGarmentAdditionalCostPayload = {
      buyerCode: styleContext.buyerCode,
      order: styleContext.order,
      typeCode: styleContext.typeCode,
      styleCode: styleContext.styleCode,
      additionalCostCode: form.additionalCostCode,
      stockCode: selectedMaterial.stockCode,
      itemCode: selectedMaterial.itemCode,
      feature1: form.feature1,
      feature2: form.feature2,
      feature3: form.feature3,
      feature4: form.feature4,
      description: form.description,
      color: form.color,
      size: form.size,
      storeCode: form.storeCode,
      currency: form.currency,
      unit: form.unit,
      quantity: Number(form.quantity) || 0,
      cost: Number(form.cost) || 0,
      isCostPerGarment: form.isCostPerGarment,
      isSemiFinishedGarment: form.isSemiFinishedGarment,
    };

    try {
      await saveEntry(payload);
      onCommitSuccess();
    } catch {
      setErrorBanner(
        "Save failed - check the fields above and try again.",
      );
    }
  };

  return (
    <Box>
      <Box
        sx={{
          backgroundColor: "rgba(96, 165, 250, 0.08)",
          border: `1px solid rgba(96, 165, 250, 0.3)`,
          borderRadius: "6px",
          padding: "8px 12px",
          fontSize: "12.5px",
          color: mockupColors.accentText,
          mb: 2,
        }}
      >
        Selected: {selectedMaterial.description} ({selectedMaterial.stockCode}/
        {selectedMaterial.itemCode})
      </Box>

      {errorBanner && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorBanner}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            label="Additional Cost Category *"
            size="small"
            fullWidth
            sx={darkFieldSx}
            value={form.additionalCostCode}
            onChange={(e) => handleChange("additionalCostCode", e.target.value)}
          >
            {additionalCostOptions.map((option) => (
              <MenuItem key={option.code} value={option.code}>
                {option.code} — {option.description}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            label="Colour"
            size="small"
            fullWidth
            sx={darkFieldSx}
            value={form.color}
            onChange={(e) => handleChange("color", e.target.value)}
          >
            <MenuItem value="">(blank = all colours)</MenuItem>
            {availableColors.map((color) => (
              <MenuItem key={color} value={color}>
                {color}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            label="Size"
            size="small"
            fullWidth
            sx={darkFieldSx}
            value={form.size}
            onChange={(e) => handleChange("size", e.target.value)}
          >
            <MenuItem value="">(blank = all sizes)</MenuItem>
            {availableSizes.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

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
        {featureMap?.feature1 && (
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label={`Enter ${featureMap.feature1}`}
              size="small"
              fullWidth
              sx={darkFieldSx}
              value={form.feature1}
              disabled={!!editingRow}
              onChange={(e) =>
                handleChange("feature1", e.target.value.toUpperCase())
              }
              slotProps={{ htmlInput: { maxLength: 4 } }}
            />
          </Grid>
        )}
        {featureMap?.feature2 && (
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label={`Enter ${featureMap.feature2}`}
              size="small"
              fullWidth
              sx={darkFieldSx}
              value={form.feature2}
              disabled={!!editingRow}
              onChange={(e) =>
                handleChange("feature2", e.target.value.toUpperCase())
              }
              slotProps={{ htmlInput: { maxLength: 4 } }}
            />
          </Grid>
        )}
        {featureMap?.feature3 && (
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label={`Enter ${featureMap.feature3}`}
              size="small"
              fullWidth
              sx={darkFieldSx}
              value={form.feature3}
              disabled={!!editingRow}
              onChange={(e) =>
                handleChange("feature3", e.target.value.toUpperCase())
              }
              slotProps={{ htmlInput: { maxLength: 4 } }}
            />
          </Grid>
        )}
        {featureMap?.feature4 && (
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label={`Enter ${featureMap.feature4}`}
              size="small"
              fullWidth
              sx={darkFieldSx}
              value={form.feature4}
              disabled={!!editingRow}
              onChange={(e) =>
                handleChange("feature4", e.target.value.toUpperCase())
              }
              slotProps={{ htmlInput: { maxLength: 4 } }}
            />
          </Grid>
        )}

        <Grid size={12}>
          <TextField
            label="Description"
            size="small"
            fullWidth
            sx={darkFieldSx}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            slotProps={{ htmlInput: { maxLength: 40 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            select
            label="Basis *"
            size="small"
            fullWidth
            sx={darkFieldSx}
            value={form.storeCode}
            onChange={(e) => handleChange("storeCode", e.target.value)}
          >
            {basisOptions.map((basis) => (
              <MenuItem key={basis.code} value={basis.code}>
                {basis.code} — {basis.description}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            select
            label="Currency *"
            size="small"
            fullWidth
            sx={darkFieldSx}
            value={form.currency}
            onChange={(e) => handleChange("currency", e.target.value)}
          >
            {currencyOptions.map((currency) => (
              <MenuItem key={currency.code} value={currency.code}>
                {currency.code}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            select
            label="Unit *"
            size="small"
            fullWidth
            sx={darkFieldSx}
            value={form.unit}
            onChange={(e) => handleChange("unit", e.target.value)}
          >
            {unitOptions.map((unit) => (
              <MenuItem key={unit.code} value={unit.code}>
                {unit.code}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            label="Quantity per Garment *"
            type="number"
            size="small"
            fullWidth
            sx={darkFieldSx}
            value={form.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Cost *"
            type="number"
            size="small"
            fullWidth
            sx={darkFieldSx}
            value={form.cost}
            onChange={(e) => handleChange("cost", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Value (computed on save)"
            size="small"
            fullWidth
            sx={darkFieldSx}
            value={previewValue}
            disabled
          />
        </Grid>

        <Grid size={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isCostPerGarment}
                onChange={(e) =>
                  handleChange("isCostPerGarment", e.target.checked)
                }
                sx={{ color: mockupColors.muted, "&.Mui-checked": { color: mockupColors.accent } }}
              />
            }
            label="Cost is per Garment (unchecked = Cost is a lump-sum Total Value)"
            sx={{ color: mockupColors.text }}
          />
        </Grid>
        <Grid size={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isSemiFinishedGarment}
                onChange={(e) =>
                  handleChange("isSemiFinishedGarment", e.target.checked)
                }
                sx={{ color: mockupColors.muted, "&.Mui-checked": { color: mockupColors.accent } }}
              />
            }
            label="Semi-Finished Garment line (no stock balance is created for this line)"
            sx={{ color: mockupColors.text }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2 }}>
        {editingRow && (
          <Button
            variant="outlined"
            onClick={onCancelEdit}
            sx={{ color: mockupColors.muted, borderColor: mockupColors.border, textTransform: "none" }}
          >
            Cancel Edit
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          sx={{
            backgroundColor: `${mockupColors.accent} !important`,
            color: "#06101f !important",
            fontWeight: 700,
            textTransform: "none",
            boxShadow: "none !important",
          }}
        >
          {isSaving ? "Saving..." : "Save Additional Cost Entry"}
        </Button>
      </Box>
    </Box>
  );
}
