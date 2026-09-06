import { useState, useCallback, useEffect, useRef } from "react";
import { Box, Paper, Typography, Alert } from "@mui/material";
import Grid from "@mui/material/Grid";
import ConsumptionScopeHeader from "./consumption-scope-header.component";
import MaterialMasterList from "./material-master-list.component"; // type OrderItemLookupRow,
import ConsumptionEntryForm from "./consumption-entry-form.component";
// import OrderItemLookupRow from "./material-master-list.component";
// import type ConsumptionLedgerGrid from "./consumption-ledger-grid.component";

// Import your TanStack Query data fetch hooks
import {
  useGetMaterialCatalog,
  useGetLedgerBreakdownByStyle,
} from "../../tanstack-hooks/material-consumption-entry.hooks";

import type {
  MaterialSelection,
  SelectedScopeContext,
  StyleMaterialConsumptionLedgerRow,
} from "./material-consumption.types";
import ConsumptionLedgerGrid from "./consumption-ledger-grid.component";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { workspaceHeadingSx } from "../../themes/workspace-theme";

export default function MaterialConsumption() {
  const [scopeContext, setScopeContext] = useState<SelectedScopeContext | null>(
    null,
  );

  // 2. FIXED: Declare the state hook to track a true data item instance row (REMOVED 'typeof')
  const [activeSelection, setActiveSelection] =
    useState<MaterialSelection | null>(null);

  // 1. ADD state memory to hold the specific row record currently being edited
  const [editingRow, setEditingRow] =
    useState<StyleMaterialConsumptionLedgerRow | null>(null);

  // Measures the form panel's own real rendered height (never the reverse -
  // the form's sx below is untouched, still just its natural minHeight/
  // content) and mirrors that exact pixel value onto the Materials list
  // panel next to it. A plain measured height, not CSS flex/grid stretch -
  // stretch was tried twice for this same pair of panels and produced a
  // "huge empty space" bug both times (see project memory); reading the
  // form's real size with ResizeObserver and applying it as a literal height
  // sidesteps whatever stretch was doing.
  const formPanelRef = useRef<HTMLDivElement | null>(null);
  const [formPanelHeight, setFormPanelHeight] = useState<number | null>(null);

  useEffect(() => {
    const node = formPanelRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const measuredHeight = entries[0]?.contentRect.height;
      if (measuredHeight) setFormPanelHeight(measuredHeight);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Memoized callback handler tracking context alterations
  const handleScopeContextChange = useCallback(
    (context: SelectedScopeContext | null) => {
      setScopeContext(context);
      setActiveSelection(null);
      setEditingRow(null); // Clear editing states on scope shift
    },
    [],
  );

  // Inside material-consumption.component.tsx:
  // Full system-wide material catalog (not style-scoped) for the picker panel -
  // only fetched once a scope/style has actually been selected and the panel
  // is visible.
  const { data: catalogGroups = [], isLoading: isCatalogLoading } =
    useGetMaterialCatalog(!!scopeContext);

  // Fetch the bottom ledger rows dynamically using your active selection context keys
  const {
    data: currentLedger = [],
    isLoading: isLedgerLoading,
    refetch,
  } = useGetLedgerBreakdownByStyle(
    {
      buyerCode: scopeContext?.buyerCode ?? 0,
      order: scopeContext?.order ?? "",
      typeCode: scopeContext?.typeCode ?? 0,
      styleCode: scopeContext?.styleCode ?? "",
    },
    !!scopeContext, // Skip loading database records until header selection is complete
  );

  return (
    <Box
      sx={{
        width: "100%",
        py: 1,
        px: 3,
        backgroundColor: DASHBOARD_COLORS.pageBg,
      }}
    >
      <Typography
        variant="h5"
        sx={{ ...workspaceHeadingSx, textTransform: "uppercase", mb: 1 }}
      >
        Material Consumption Details
      </Typography>

      <ConsumptionScopeHeader onScopeChange={handleScopeContextChange} />

      {scopeContext ? (
        <Box>
          {/* Top Panel: Split Master Checklist & Data Form Controls */}
          <Grid container spacing={3}>
            {/* <Grid size={{ xs: 12, md: 4 }}>
              <Paper elevation={2} sx={{ p: 2, minHeight: "420px" }}>
                <MaterialMasterList
                  onSelectMaterial={(item) => setActiveSelection(item)}
                />
              </Paper>
            </Grid> */}

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  // Mirrors the form panel's actual measured height (see
                  // formPanelHeight above) - falls back to 480px before the
                  // first measurement lands. The panel itself never scrolls
                  // (overflow: hidden) - only the MaterialMasterList table's
                  // own internal scroll region (set via
                  // muiTableContainerProps) scrolls, avoiding the confusing
                  // double-scrollbar of both this Paper and the table
                  // scrolling at once.
                  height: formPanelHeight ? `${formPanelHeight}px` : "480px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: DASHBOARD_COLORS.cardBg,
                  border: `1px solid ${DASHBOARD_COLORS.border}`,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: "bold",
                    textAlign: "center",
                    mb: 1,
                    color: DASHBOARD_COLORS.accentStrong,
                  }}
                >
                  Main Materials
                </Typography>
                {/* Pass the loaded catalog array directly down as a prop */}
                <MaterialMasterList
                  catalogGroups={catalogGroups}
                  isLoading={isCatalogLoading}
                  selectedMaterial={activeSelection}
                  onSelectMaterial={(item) => {
                    setActiveSelection(item);
                    setEditingRow(null); // Clear active editing if they select a brand new master category
                  }}
                />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper
                ref={formPanelRef}
                elevation={2}
                sx={{
                  p: 2,
                  minHeight: "480px",
                  backgroundColor: DASHBOARD_COLORS.cardBg,
                  border: `1px solid ${DASHBOARD_COLORS.border}`,
                }}
              >
                {activeSelection ? (
                  <ConsumptionEntryForm
                    styleContext={scopeContext}
                    selectedMaterial={activeSelection}
                    // 2. Pass down the editing row record memory and clear function
                    editingRow={editingRow}
                    onCommitSuccess={() => {
                      refetch();
                      setEditingRow(null); // Reset row mode on successful save
                    }} // Refresh the grid automatically on successful save
                  />
                ) : (
                  <Box
                    sx={{
                      height: "350px",
                      color: "text.secondary",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body1">
                      ← Select an item from the left inventory checklist panel
                      to begin entering consumption details.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Bottom Panel: The Consolidated Continuous Spreadsheet Data Log */}
          <Paper
            elevation={3}
            sx={{
              p: 2,
              mt: 2,
              backgroundColor: DASHBOARD_COLORS.cardBg,
              border: `1px solid ${DASHBOARD_COLORS.border}`,
            }}
          >
            <ConsumptionLedgerGrid
              styleContext={scopeContext}
              ledgerData={currentLedger}
              isLoading={isLedgerLoading}
              onRefresh={() => refetch()}
              editingRow={editingRow}
              // 3. Mount the click handler to push selected rows straight up into edit state
              onEditRowSelect={(row) => {
                // Instantly focus the left selection category context
                setActiveSelection({
                  stockCode: row.stockCode,
                  itemCode: row.itemCode,
                  description: "Editing Active Item Line",
                });
                setEditingRow(row); // Set form to edit values
              }}
            />
          </Paper>
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
          header above to load the consumption details.
        </Alert>
      )}
    </Box>
  );
}
