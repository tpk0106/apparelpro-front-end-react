import { useState, useCallback } from "react";
import { Box, ThemeProvider, Typography, Alert } from "@mui/material";
import Grid from "@mui/material/Grid";
import ConsumptionScopeHeader from "../material-consumption/consumption-scope-header.component";
import type {
  MaterialSelection,
  SelectedScopeContext,
} from "../material-consumption/material-consumption.types";
import { useGetMaterialCatalog } from "../../tanstack-hooks/material-consumption-entry.hooks";
import { useGetGarmentAdditionalCosts } from "../../tanstack-hooks/garment-additional-cost.hooks";
import type { GarmentAdditionalCostRow } from "./garment-additional-cost.types";
import GarmentAdditionalCostItemPicker from "./garment-additional-cost-item-picker.component";
import GarmentAdditionalCostEntryForm from "./garment-additional-cost-entry-form.component";
import GarmentAdditionalCostGrid from "./garment-additional-cost-grid.component";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { workspaceHeadingSx } from "../../themes/workspace-theme";
import { asideMenuTitleTypographyTheme } from "../../themes/themes";

// RETIRED (2026-09-03): this screen used to carry its own isolated "mockup"
// dark-card styling (see garment-additional-cost.types.ts's commented-out
// mockupColors for the old palette reference) instead of the shared
// olive/copper theme every other screen uses. Now converted over to
// DASHBOARD_COLORS / useDropdownTheme / the shared button/table tokens,
// matching Material Consumption (this screen's layout twin) and the rest of
// the app.
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
    <Box sx={{ width: "100%", py: 1, px: 3, backgroundColor: DASHBOARD_COLORS.pageBg }}>
      <ThemeProvider theme={asideMenuTitleTypographyTheme}>
        <Typography sx={{ ...workspaceHeadingSx, textTransform: "uppercase", mb: 2 }}>
          Additional Costs per Garment
        </Typography>
      </ThemeProvider>

      <ConsumptionScopeHeader onScopeChange={handleScopeContextChange} />

      {scopeContext ? (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  backgroundColor: DASHBOARD_COLORS.cardBg,
                  border: `1px solid ${DASHBOARD_COLORS.border}`,
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
                    color: DASHBOARD_COLORS.accentStrong,
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
                  backgroundColor: DASHBOARD_COLORS.cardBg,
                  border: `1px solid ${DASHBOARD_COLORS.border}`,
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
                      color: DASHBOARD_COLORS.textSecondary,
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
              backgroundColor: DASHBOARD_COLORS.cardBg,
              border: `1px solid ${DASHBOARD_COLORS.border}`,
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
          sx={{
            m: 2,
            fontWeight: "bold",
            color: DASHBOARD_COLORS.accentStrong,
            backgroundColor: DASHBOARD_COLORS.cardBg,
            borderColor: DASHBOARD_COLORS.border,
          }}
        >
          Please select a Buyer, Purchase Order, Garment Type, and Style in the
          header above to load the Additional Cost entries.
        </Alert>
      )}
    </Box>
  );
}
