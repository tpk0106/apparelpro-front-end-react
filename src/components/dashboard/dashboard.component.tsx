import { useMemo, useState } from "react";
import { Box, Card, Chip, Grid, Tab, Tabs, ThemeProvider, Typography, createTheme, type Theme } from "@mui/material";
import StyleScopePicker, { type StyleScope } from "../production/style-scope/style-scope-picker.component";
import SectionFunnel from "./section-funnel.component";
import CompletionRing from "./completion-ring.component";
import LineSchedule from "./line-schedule.component";
import DailyTrendChart from "./daily-trend-chart.component";
import OrderManagementSummaryCard from "./order-management-summary.component";
import FulfillmentMeter from "./fulfillment-meter.component";
import ColorSizeMixBars from "./color-size-mix.component";
import StockItemMovementBars from "./stock-item-movement.component";
import StockAlerts from "./stock-alerts.component";
import KpiTile from "../common/kpi-tile";
import {
  useGetCurrentStyle,
  useGetProductionProgress,
  useGetDailyTrendAllSections,
  useGetOrderManagementSummary,
  useGetOrderwiseInventorySummary,
} from "../../tanstack-hooks/dashboard.hooks";
import { asideMenuTitleTypographyTheme } from "../../themes/themes";
import { DASHBOARD_COLORS } from "./dashboard-theme";

const KPI_GRID_SIZE = { xs: 6, sm: 3 };

// Crisp elevated edge instead of the flat MUI "outlined" look - a defined
// offset shadow plus a slightly stronger border reads as a raised panel
// rather than a hairline rectangle, which is what this screen needs as the
// app's landing page.
const CARD_SX = {
  backgroundColor: DASHBOARD_COLORS.cardBg,
  border: `1px solid ${DASHBOARD_COLORS.border}`,
  boxShadow: "0 10px 28px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.3)",
};

// MUI's default primary.main (#60a5fa, the app-wide blue) drives things this
// page never explicitly styled - Autocomplete's hover/selected option
// highlight, focus rings, checkbox/radio accents. Rather than patch every
// such component individually, this scopes primary.main to the olive accent
// for the whole dashboard subtree - built as a function of the outer theme
// (not a fresh createTheme()) so everything else (typography, dark palette,
// every other override) still comes from the app's real theme.
//
// Also overrides the input text color: the app-wide theme sets it to
// #141922 (near-black) via a `.MuiTextField-root .MuiOutlinedInput-root`
// nested selector (components.MuiTextField.styleOverrides.root), meant for
// the light input fills used everywhere else. MUI outlined inputs have no
// fill of their own, so on this page's dark cards that text was rendering
// black-on-dark and invisible - a straight MuiOutlinedInput override loses
// to that rule on CSS specificity (2 classes vs 1) regardless of load
// order, so this has to target the exact same nested selector to win.
const withOliveAccent = (outerTheme: Theme) =>
  createTheme(outerTheme, {
    palette: { primary: { main: DASHBOARD_COLORS.accentStrong } },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": { color: DASHBOARD_COLORS.textPrimary },
          },
        },
      },
    },
  });

const DashboardHome = () => {
  const { data: currentStyle, isLoading: isLoadingCurrentStyle } = useGetCurrentStyle();
  const [overrideScope, setOverrideScope] = useState<StyleScope | null>(null);
  const [tab, setTab] = useState<"order" | "inventory" | "production">("production");

  const activeScope: StyleScope | null = overrideScope ?? (currentStyle
    ? {
        buyerCode: currentStyle.buyerCode,
        order: currentStyle.order,
        typeCode: currentStyle.typeCode,
        styleCode: currentStyle.styleCode,
      }
    : null);

  const { data: progress, isLoading: isLoadingProgress } = useGetProductionProgress(activeScope);
  const { data: trendSeries, isLoading: isLoadingTrend } = useGetDailyTrendAllSections(activeScope);
  const { data: orderSummary, isLoading: isLoadingOrderSummary } = useGetOrderManagementSummary(activeScope);
  const { data: inventorySummary, isLoading: isLoadingInventorySummary } = useGetOrderwiseInventorySummary(activeScope);

  const contractSection = useMemo(
    () => progress?.sections.find((s) => s.sectionCode === progress.contractSectionCode),
    [progress],
  );
  const lastSection = progress?.sections[progress.sections.length - 1];
  const throughLinePct = lastSection && lastSection.ceilingQuantity > 0
    ? Math.round((lastSection.toDateQuantity / lastSection.ceilingQuantity) * 100)
    : undefined;
  const criticalCount = progress?.lineAllocations.filter((a) => a.isCritical).length;

  return (
    <ThemeProvider theme={withOliveAccent}>
    <div
      className="flex flex-col w-[85%] mx-auto justify-around mt-10 mb-12"
      style={{ backgroundColor: DASHBOARD_COLORS.pageBg, borderRadius: 16, padding: "1.5rem" }}
    >
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography sx={{ color: DASHBOARD_COLORS.accentStrong }}>Floor pulse</Typography>
        </ThemeProvider>
      </div>

      <Card variant="outlined" sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", ...CARD_SX }}>
        {activeScope ? (
          <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary }}>
            {activeScope.buyerCode} / {activeScope.order} / {activeScope.typeCode} / {activeScope.styleCode}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textSecondary }}>
            {isLoadingCurrentStyle
              ? "Loading..."
              : "No production activity yet - pick a style below, or set a fallback in System Parameters."}
          </Typography>
        )}
        {!overrideScope && currentStyle && (
          <Chip
            size="small"
            label={currentStyle.source === "pinned" ? "Pinned in System Parameters" : "Auto-picked from latest floor entry"}
            sx={{
              bgcolor: "rgba(122,155,82,0.16)",
              color: DASHBOARD_COLORS.accentStrong,
              border: `1px solid ${DASHBOARD_COLORS.borderStrong}`,
            }}
          />
        )}
        {overrideScope && (
          <Chip size="small" color="warning" label="Viewing a different style" onDelete={() => setOverrideScope(null)} />
        )}
      </Card>

      <StyleScopePicker onScopeChange={setOverrideScope} sx={CARD_SX} />

      {activeScope && (
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <KpiTile
            label="Through the line"
            value={throughLinePct !== undefined ? `${throughLinePct}%` : undefined}
            loading={isLoadingProgress}
            color={DASHBOARD_COLORS.accentStrong}
            size={KPI_GRID_SIZE}
          />
          <KpiTile
            label={`${contractSection?.sectionDescription ?? "Contract section"} to-date`}
            value={contractSection?.toDateQuantity?.toLocaleString()}
            loading={isLoadingProgress}
            size={KPI_GRID_SIZE}
          />
          <KpiTile
            label="Active lines"
            value={progress?.lineAllocations.length}
            loading={isLoadingProgress}
            size={KPI_GRID_SIZE}
          />
          <KpiTile
            label="Critical allocations"
            value={criticalCount}
            loading={isLoadingProgress}
            color={criticalCount ? DASHBOARD_COLORS.critical : undefined}
            size={KPI_GRID_SIZE}
          />
        </Grid>
      )}

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 2,
          borderBottom: `1px solid ${DASHBOARD_COLORS.border}`,
          "& .MuiTabs-indicator": { backgroundColor: DASHBOARD_COLORS.accentStrong },
          "& .MuiTab-root": { color: DASHBOARD_COLORS.textSecondary },
          "& .MuiTab-root.Mui-selected": { color: DASHBOARD_COLORS.textPrimary },
        }}
      >
        <Tab value="order" label="Order management" />
        <Tab value="inventory" label="Orderwise inventory" />
        <Tab value="production" label="Production progress" />
      </Tabs>

      {tab === "order" && (
        <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 2 }}>
          <Card variant="outlined" sx={{ p: 2, ...CARD_SX }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: DASHBOARD_COLORS.textPrimary }}>Style header</Typography>
            {!activeScope ? (
              <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>Select a style to see its order details.</Typography>
            ) : isLoadingOrderSummary ? (
              <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>Loading...</Typography>
            ) : orderSummary ? (
              <OrderManagementSummaryCard summary={orderSummary} />
            ) : (
              <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>No style master record found for this scope.</Typography>
            )}
          </Card>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Card variant="outlined" sx={{ p: 2, ...CARD_SX }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: DASHBOARD_COLORS.textPrimary }}>Order fulfillment</Typography>
              {orderSummary && <FulfillmentMeter summary={orderSummary} />}
            </Card>
            <Card variant="outlined" sx={{ p: 2, ...CARD_SX }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: DASHBOARD_COLORS.textPrimary }}>Color / size mix</Typography>
              {orderSummary && <ColorSizeMixBars mix={orderSummary.colorSizeMix} />}
            </Card>
          </Box>
        </Box>
      )}

      {tab === "inventory" && (
        <Box sx={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 2 }}>
          <Card variant="outlined" sx={{ p: 2, ...CARD_SX }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: DASHBOARD_COLORS.textPrimary }}>Stock movement by item</Typography>
            {!activeScope ? (
              <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>Select a style to see stock movement for its order.</Typography>
            ) : isLoadingInventorySummary ? (
              <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>Loading...</Typography>
            ) : inventorySummary ? (
              <StockItemMovementBars items={inventorySummary.items} />
            ) : (
              <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>No stock movement posted for this order yet.</Typography>
            )}
          </Card>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Card variant="outlined" sx={{ p: 2, ...CARD_SX }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: DASHBOARD_COLORS.textPrimary }}>Balance alerts</Typography>
              {inventorySummary && <StockAlerts items={inventorySummary.items} />}
            </Card>
            <Card variant="outlined" sx={{ p: 2, ...CARD_SX }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: DASHBOARD_COLORS.textPrimary }}>Order stock health</Typography>
              {inventorySummary && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary }}>
                    {inventorySummary.totalLineItems} line items
                  </Typography>
                  <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.textSecondary }}>
                    {inventorySummary.fullyReceivedCount} fully received &middot; {inventorySummary.shortfallCount} short &middot; {inventorySummary.damagedItemCount} with damage
                  </Typography>
                </Box>
              )}
            </Card>
          </Box>
        </Box>
      )}

      {tab === "production" && (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 2, mb: 2 }}>
            <Card variant="outlined" sx={{ p: 2, ...CARD_SX }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: DASHBOARD_COLORS.textPrimary }}>Section funnel</Typography>
              {!activeScope ? (
                <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>Select a style to see production progress.</Typography>
              ) : isLoadingProgress ? (
                <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>Loading...</Typography>
              ) : progress ? (
                <SectionFunnel sections={progress.sections} contractSectionCode={progress.contractSectionCode} />
              ) : null}
            </Card>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Card variant="outlined" sx={{ p: 2, ...CARD_SX }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: DASHBOARD_COLORS.textPrimary }}>Pipeline completion</Typography>
                {progress && <CompletionRing sections={progress.sections} />}
              </Card>

              <Card variant="outlined" sx={{ p: 2, ...CARD_SX }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: DASHBOARD_COLORS.textPrimary }}>Line schedule</Typography>
                {!activeScope ? (
                  <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>Select a style to see its line schedule.</Typography>
                ) : isLoadingProgress ? (
                  <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>Loading...</Typography>
                ) : progress ? (
                  <LineSchedule lineAllocations={progress.lineAllocations} />
                ) : null}
              </Card>
            </Box>
          </Box>

          <Card variant="outlined" sx={{ p: 2, ...CARD_SX }}>
            {!activeScope ? (
              <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>Select a style to see its daily trend.</Typography>
            ) : isLoadingTrend ? (
              <Typography sx={{ color: DASHBOARD_COLORS.textSecondary }}>Loading...</Typography>
            ) : (
              <DailyTrendChart series={trendSeries ?? []} />
            )}
          </Card>
        </>
      )}
    </div>
    </ThemeProvider>
  );
};

export default DashboardHome;
