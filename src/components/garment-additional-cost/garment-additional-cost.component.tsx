import { useState, useCallback } from "react";
import { Box, Typography, Alert } from "@mui/material";
import Grid from "@mui/material/Grid";
import ConsumptionScopeHeader from "../material-consumption/consumption-scope-header.component";
import type {
  MaterialSelection,
  SelectedScopeContext,
} from "../material-consumption/material-consumption.types";
import { useGetMaterialCatalog } from "../../tanstack-hooks/material-consumption-entry.hooks";
import { useGetGarmentAdditionalCosts } from "../../tanstack-hooks/garment-additional-cost.hooks";
import type { GarmentAdditionalCostRow } from "./garment-additional-cost.types";
import { mockupColors } from "./garment-additional-cost.types";
import GarmentAdditionalCostItemPicker from "./garment-additional-cost-item-picker.component";
import GarmentAdditionalCostEntryForm from "./garment-additional-cost-entry-form.component";
import GarmentAdditionalCostGrid from "./garment-additional-cost-grid.component";

// SCOPED LOOK-AND-FEEL EXPERIMENT (2026-08-08, per user request): this screen and its four
// sibling files (garment-additional-cost.types.ts, -item-picker, -entry-form, -grid) carry
// their own dark-card styling matching the mockup the user approved, rather than the shared
// apparelProDarkTheme look every other screen (including Material Consumption, which this
// screen's layout mirrors) uses. ConsumptionScopeHeader is the one piece reused verbatim, per
// the user's own plan - it is NOT restyled, so there is a deliberate visual seam between it and
// the dark cards below. Reverting this experiment is just deleting these five files and
// re-pointing the "additional" route/nav entry at nothing (the feature simply wouldn't exist
// yet) - nothing shared was touched to make this happen.
export default function GarmentAdditionalCostPage() {
  const [scopeContext, setScopeContext] = useState<SelectedScopeContext | null>(
    null,
  );
  const [activeSelection, setActiveSelection] =
    useState<MaterialSelection | null>(null);
  const [editingRow, setEditingRow] = useState<GarmentAdditionalCostRow | null>(
    null,
  );

  const handleScopeContextChange = useCallback(
    (context: SelectedScopeContext | null) => {
      setScopeContext(context);
      setActiveSelection(null);
      setEditingRow(null);
    },
    [],
  );

  const { data: catalogGroups = [], isLoading: isCatalogLoading } =
    useGetMaterialCatalog(!!scopeContext);

  const {
    data: existingEntries = [],
    isLoading: isEntriesLoading,
    refetch,
  } = useGetGarmentAdditionalCosts(
    {
      buyerCode: scopeContext?.buyerCode ?? 0,
      order: scopeContext?.order ?? "",
      typeCode: scopeContext?.typeCode ?? 0,
      styleCode: scopeContext?.styleCode ?? "",
    },
    !!scopeContext,
  );

  return (
    <Box sx={{ width: "100%", p: 1, backgroundColor: mockupColors.bg }}>
      <Typography
        sx={{
          textAlign: "center",
          fontSize: "20px",
          fontWeight: 700,
          color: mockupColors.accentText,
          mb: 0.5,
        }}
      >
        ADDITIONAL COSTS PER GARMENT
      </Typography>
      <Typography
        sx={{
          textAlign: "center",
          color: mockupColors.muted,
          fontSize: "12px",
          mb: 2.5,
        }}
      >
        Order Management &rsaquo; Material Consumption &rsaquo; Additional Costs per Garment
      </Typography>

      <ConsumptionScopeHeader onScopeChange={handleScopeContextChange} />

      {scopeContext ? (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  backgroundColor: mockupColors.surface,
                  border: `1px solid ${mockupColors.border}`,
                  borderRadius: "10px",
                  p: 2,
                  height: "480px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "13px",
                    textAlign: "center",
                    mb: 1,
                    color: mockupColors.text,
                  }}
                >
                  MAIN MATERIALS
                </Typography>
                <GarmentAdditionalCostItemPicker
                  catalogGroups={catalogGroups}
                  isLoading={isCatalogLoading}
                  selectedMaterial={activeSelection}
                  onSelectMaterial={(item) => {
                    setActiveSelection(item);
                    setEditingRow(null);
                  }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Box
                sx={{
                  backgroundColor: mockupColors.surface,
                  border: `1px solid ${mockupColors.border}`,
                  borderRadius: "10px",
                  p: 2,
                  minHeight: "480px",
                }}
              >
                {activeSelection ? (
                  <GarmentAdditionalCostEntryForm
                    styleContext={scopeContext}
                    selectedMaterial={activeSelection}
                    editingRow={editingRow}
                    onCommitSuccess={() => {
                      refetch();
                      setEditingRow(null);
                    }}
                    onCancelEdit={() => setEditingRow(null)}
                  />
                ) : (
                  <Box
                    sx={{
                      height: "350px",
                      color: mockupColors.muted,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      px: 4,
                    }}
                  >
                    <Typography variant="body1">
                      ← Select an item from the left inventory checklist panel
                      to begin entering an additional cost.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          <Box
            sx={{
              backgroundColor: mockupColors.surface,
              border: `1px solid ${mockupColors.border}`,
              borderRadius: "10px",
              p: 2,
              mt: 2,
            }}
          >
            <GarmentAdditionalCostGrid
              styleContext={scopeContext}
              rows={existingEntries}
              isLoading={isEntriesLoading}
              onEditRowSelect={(row) => {
                setActiveSelection({
                  stockCode: row.stockCode,
                  itemCode: row.itemCode,
                  description: row.description || "Editing Active Item Line",
                });
                setEditingRow(row);
              }}
            />
          </Box>
        </Box>
      ) : (
        <Alert
          severity="info"
          variant="outlined"
          sx={{ m: 2, fontWeight: "bold", color: mockupColors.accentText }}
        >
          Please select a Buyer, Purchase Order, Garment Type, and Style in the
          header above to load the Additional Cost entries.
        </Alert>
      )}
    </Box>
  );
}
