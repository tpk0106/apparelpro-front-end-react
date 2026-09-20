import { useState, useCallback, useRef } from "react";
import { Box, Paper, Typography, Alert, IconButton, Tooltip } from "@mui/material";
import Grid from "@mui/material/Grid";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AiSummariseButton from "../ai/AiSummariseButton";
import AiChatWindow from "../ai/AiChatWindow";
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
import { copperTextColor } from "../../themes/button-color-themes";

// THIRD ATTEMPT AT THIS BUG (see feedback_material_consumption_panel_height /
// project_material_consumption_height_todo memory): the previous
// ResizeObserver-based "measure the form, mirror it onto the list" approach
// worked for the placeholder state but drifted out of sync again once
// ConsumptionEntryForm actually mounted (its content height changes several
// times as loading states resolve, and again whenever the Calculate
// Consumptions toggle or Feature1-4 fields change what's rendered - each of
// those re-fires the observer, but kept the two panels chasing each other's
// height instead of ever landing on one fixed number).
//
// This attempt removes the "measure and mirror" mechanism entirely: both
// panels get the SAME hardcoded height, chosen generously enough to fit the
// tallest realistic form state (edit mode, a material with all 4 dynamic
// Feature fields, Calculate Consumptions = Yes, and a Total Requirement line
// showing after Calculate has run) without scrolling. A shorter state (fewer
// features, manual entry mode, before Calculate has run) will show empty
// space below its content instead - a deliberate tradeoff the user explicitly
// chose over any form of scrolling, since a scrollbar that only appears in
// some states/modes was rejected twice before as "looks broken".
//
// If a future content addition ever needs more room than this, bump this one
// constant - do not reintroduce ResizeObserver/measured-height syncing for
// this pair of panels, it has failed three times now.
//
// TUNED (2026-09-06): 760 -> 660 (trimmed a ~10-15% gap) -> 600 (user reported
// a further small ~10-15% gap remained at 660 - ~66-99px - and asked to trim
// 75% of that gap, i.e. remove ~62px). If it still leaves a gap or now clips
// content, adjust this single number - see the comment block above for why
// nothing else about the mechanism should change.
const MATERIAL_CONSUMPTION_PANEL_HEIGHT = 600;

export default function MaterialConsumption() {
  const [scopeContext, setScopeContext] = useState<SelectedScopeContext | null>(
    null,
  );

  // AI Chat window open/close state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // 2. FIXED: Declare the state hook to track a true data item instance row (REMOVED 'typeof')
  const [activeSelection, setActiveSelection] =
    useState<MaterialSelection | null>(null);

  // 1. ADD state memory to hold the specific row record currently being edited
  const [editingRow, setEditingRow] =
    useState<StyleMaterialConsumptionLedgerRow | null>(null);

  // Scroll target for the "jump back up to the form" behavior below - the top
  // Grid row containing both the Materials list and the form panel.
  const formSectionRef = useRef<HTMLDivElement | null>(null);

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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Typography
          variant="h5"
          sx={{ ...workspaceHeadingSx, textTransform: "uppercase", mb: 0 }}
        >
          Material Consumption Details
        </Typography>
        {scopeContext && (
          <AiSummariseButton
            entityType="Style"
            entityKey={`${scopeContext.buyerCode}/${scopeContext.order}/${scopeContext.typeCode}/${scopeContext.styleCode}`}
            tooltipLabel="AI Summarise this style's consumption"
          />
        )}

        {/* Spacer pushes the chat icon to the right */}
        <Box sx={{ flex: 1 }} />

        {scopeContext && (
          <Tooltip title="AI Chat">
            <IconButton
              onClick={() => setIsChatOpen(true)}
              sx={{
                color: copperTextColor,
                "&:hover": {
                  backgroundColor: "rgba(201, 128, 61, 0.08)",
                },
              }}
            >
              <SmartToyIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <ConsumptionScopeHeader onScopeChange={handleScopeContextChange} />

      {scopeContext ? (
        <Box>
          {/* Top Panel: Split Master Checklist & Data Form Controls */}
          <Grid ref={formSectionRef} container spacing={3}>
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
                  // Same fixed height as the form panel opposite it (see
                  // MATERIAL_CONSUMPTION_PANEL_HEIGHT above) - not measured,
                  // not stretched, just the same literal number on both. The
                  // panel itself never scrolls (overflow: hidden) - only the
                  // MaterialMasterList table's own internal scroll region
                  // (set via muiTableContainerProps) scrolls, avoiding the
                  // confusing double-scrollbar of both this Paper and the
                  // table scrolling at once.
                  height: `${MATERIAL_CONSUMPTION_PANEL_HEIGHT}px`,
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
                elevation={2}
                sx={{
                  p: 2,
                  // Same fixed height as the list panel opposite it (see
                  // MATERIAL_CONSUMPTION_PANEL_HEIGHT above), not a natural
                  // minHeight that grows with content - that growth is
                  // exactly what put the two panels out of sync before.
                  // overflow: hidden is a safety net (matches the list
                  // panel's own overflow handling), not the expected path -
                  // the fixed height is chosen to comfortably fit the
                  // tallest realistic form state without clipping anything.
                  height: `${MATERIAL_CONSUMPTION_PANEL_HEIGHT}px`,
                  overflow: "hidden",
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
                // Clicking Edit on a bottom-row ledger entry (especially far
                // down a long list) left the form off-screen above, with no
                // indication it had actually loaded - scroll it back into
                // view so the operator sees their selection immediately.
                formSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
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

      {/* Floating AI chat window — position:fixed, never affects page layout */}
      {scopeContext && (
        <AiChatWindow
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          entityType="Style"
          entityKey={`${scopeContext.buyerCode}/${scopeContext.order}/${scopeContext.typeCode}/${scopeContext.styleCode}`}
        />
      )}
    </Box>
  );
}
