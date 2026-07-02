import { useState, useCallback, useEffect } from "react";
import { Box, Paper, Typography, Alert } from "@mui/material";
import Grid from "@mui/material/Grid";
import ConsumptionScopeHeader from "./consumption-scope-header.component";
import MaterialMasterList from "./material-master-list.component"; // type OrderItemLookupRow,
import ConsumptionEntryForm from "./consumption-entry-form.component";
// import OrderItemLookupRow from "./material-master-list.component";
// import type ConsumptionLedgerGrid from "./consumption-ledger-grid.component";

//import { useGetBreakdownByStyleQuery } from "./materialConsumptionApi";

// Import your custom RTK Query data fetch hooks
import {
  useGetAvailableMaterialsQuery,
  useGetBreakdownByStyleQuery,
} from "../../services/material-consumption.services"; // Fetch mapping endpoint

import type {
  OrderItemServiceModel,
  SelectedScopeContext,
} from "./material-consumption.types";
import ConsumptionLedgerGrid, {
  type StyleMaterialConsumptionLedgerRow,
} from "./consumption-ledger-grid.component";

export default function MaterialConsumption() {
  const [scopeContext, setScopeContext] = useState<SelectedScopeContext | null>(
    null,
  );

  // 2. FIXED: Declare the state hook to track a true data item instance row (REMOVED 'typeof')
  const [activeSelection, setActiveSelection] =
    useState<OrderItemServiceModel | null>(null);

  // 1. ADD state memory to hold the specific row record currently being edited
  const [editingRow, setEditingRow] =
    useState<StyleMaterialConsumptionLedgerRow | null>(null);

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
  const { data: materialsData = [], isLoading: isChecklistLoading } =
    useGetAvailableMaterialsQuery(
      {
        buyerCode: scopeContext?.buyerCode ?? 0,
        order: scopeContext?.order ?? "",
        typeCode: scopeContext?.typeCode ?? 0,
        styleCode: scopeContext?.styleCode ?? "",
      },
      { skip: !scopeContext },
    );

  // Fetch the bottom ledger rows dynamically using your active selection context keys
  const {
    data: currentLedger = [],
    isLoading: isLedgerLoading,
    refetch,
  } = useGetBreakdownByStyleQuery(
    {
      buyerCode: scopeContext?.buyerCode ?? 0,
      order: scopeContext?.order ?? "",
      typeCode: scopeContext?.typeCode ?? 0,
      styleCode: scopeContext?.styleCode ?? "",
    },
    { skip: !scopeContext }, // Skip loading database records until header selection is complete
  );

  useEffect(() => {
    console.log("loaded buyer ", scopeContext?.buyerCode);
    console.log("loaded order ", scopeContext?.order);
    console.log("loaded type ", scopeContext?.typeCode);
    console.log("loaded style ", scopeContext?.styleCode);
    console.log("loaded style ledger ", currentLedger);
  });

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold", color: "#1a237e", mb: 2 }}
      >
        Material Consumption Master Ledger
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
              <Paper elevation={2} sx={{ p: 2, minHeight: "420px" }}>
                {/* Pass the loaded materialsData array directly down as a prop */}
                <MaterialMasterList
                  materialsList={materialsData}
                  isLoading={isChecklistLoading}
                  onSelectMaterial={(item) => {
                    setActiveSelection(item);
                    setEditingRow(null); // Clear active editing if they select a brand new master category
                  }}
                />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper elevation={2} sx={{ p: 2, minHeight: "420px" }}>
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
          <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
            <ConsumptionLedgerGrid
              styleContext={scopeContext}
              ledgerData={currentLedger}
              isLoading={isLedgerLoading}
              onRefresh={() => refetch()}
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
          sx={{ mt: 2, fontWeight: "bold" }}
        >
          Please select a Buyer, Purchase Order, Garment Type, and Style in the
          header above to load the consumption workspace.
        </Alert>
      )}
    </Box>
  );
}
