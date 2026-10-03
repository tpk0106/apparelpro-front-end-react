// ─────────────────────────────────────────────────────────────────────────────
// 🎓 ANOMALY ALERT PANEL — Copper Theme Edition
// Phase 3: Anomaly Detection & Alerts — the full-page alert management view.
//
// This is the page merchandisers navigate to (via "View All Alerts" in the
// bell dropdown or a direct route). It shows:
//   1. FILTER BAR: Filter by severity, anomaly type, and status
//   2. ALERT LIST: Paginated table of all anomaly alerts
//   3. ALERT DETAIL: Expanded view with deviation %, expected/actual values,
//      recommended action, and status lifecycle buttons
//
// 🎓 COPPER THEME:
// This panel now uses the project-wide copper design system instead of the
// older blue (#60a5fa) accent. Every AI component (AiChatWindow, RagSearchPanel,
// AiVoicePanel, AiSummariseButton, SopAdminPage) uses the copper palette —
// this panel must match. Key tokens:
//   - copperTextColor (#C9803D): primary accent for text, borders, icons
//   - copperGlossButtonSx: gradient glass-bottle button for primary actions
//   - copperLight rgba(201,128,61,0.15): tinted backgrounds
//   - copperGlow rgba(201,128,61,0.3): focus rings, box shadows, hover states
//
// 🎓 ARCHITECTURE:
// - Uses useAnomalyAlerts hook for the paginated list
// - Uses useUpdateAlertStatus mutation for status changes
// - Uses useTriggerFullScan mutation for the "Scan Now" button
// - All state is local (filters, pagination, selected alert) — no Redux needed
//   because this is a self-contained page with no cross-component state sharing
//
// 🎓 WHY NOT material-react-table?
// The alert list is relatively simple (no inline editing, no column reordering).
// A custom table gives us more control over the alert card layout, status
// badges, and action buttons without fighting MRT's configuration. For the
// complex order/inventory grids we use MRT; for a notification-style list,
// a custom layout works better.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
// 🎓 ICON IMPORTS:
// This project's @mui/icons-material version doesn't include the "Outline"
// variants (CheckCircleOutline, DeleteOutline, ErrorOutline). Using the
// base icons instead — same visual intent, just filled style.
// WarningAmber is the project's established replacement for ErrorOutline
// (see AiVoicePanel.tsx for precedent).
import CheckIcon from "@mui/icons-material/Check";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorIcon from "@mui/icons-material/WarningAmber";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";

// 🎓 COPPER THEME IMPORTS:
// Import the project's copper design tokens from the central theme files.
// copperGlossButtonSx — the gradient glass-bottle button style used by every
//   AI component's primary action (AiChatFab, AiSummariseButton, RagSearchPanel)
// copperTextColor — the canonical copper accent (#C9803D), used for headings,
//   borders, icons, and any text that needs the copper identity
import { copperGlossButtonSx, copperTextColor } from "../../themes/button-color-themes";

import type {
  AnomalyAlert,
  AnomalyType,
  AnomalySeverity,
  AnomalyStatus,
} from "../../interfaces/ai/anomaly-alert.interfaces";
import {
  useAnomalyAlerts,
  useUpdateAlertStatus,
  useTriggerFullScan,
} from "../../tanstack-hooks/ai/anomaly-alert.hooks";

// ─── Copper Alert Color Palette ─────────────────────────────
// 🎓 Matches the CHAT_COLORS / VOICE_COLORS pattern used in AiChatWindow,
// RagSearchPanel, and AiVoicePanel — same copper tokens, centralised here
// so the panel reads as part of the same AI component family.
const ALERT_COLORS = {
  canvas: "#0A0E14",        // 🎓 App-wide canvas background
  surface: "#141922",       // 🎓 Panel/card surfaces
  input: "#0D1117",         // 🎓 Input fields, stat boxes
  text: "#F4F6F8",          // 🎓 Primary text
  muted: "#8B93A1",         // 🎓 Secondary/muted text
  copper: "#C9803D",        // 🎓 Primary copper accent
  copperLight: "rgba(201, 128, 61, 0.15)", // 🎓 Tinted backgrounds
  copperGlow: "rgba(201, 128, 61, 0.3)",   // 🎓 Focus rings, glows
  copperWarm: "#F3E9D6",    // 🎓 Warm off-white (button text on copper)
  copperDark: "#6B4420",    // 🎓 Dark copper for borders, depth
  border: "rgba(255, 255, 255, 0.06)",     // 🎓 Subtle divider borders
  borderHover: "rgba(255, 255, 255, 0.12)",// 🎓 Hover state borders
} as const;

// ─── Constants ──────────────────────────────────────────────

// 🎓 Severity colors — these are semantic, NOT theme-dependent.
// Red/orange/amber/blue communicate urgency regardless of whether the
// app accent is blue or copper. Keep them distinct from the copper accent.
const severityColors: Record<AnomalySeverity, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#f59e0b",
  LOW: "#60a5fa",  // 🎓 Low severity stays blue — it's a calm/info tone
};

// 🎓 Status colors — green for resolved, copper for acknowledged (was blue),
// gray for dismissed. Acknowledged now uses copper to match the theme.
const statusColors: Record<AnomalyStatus, string> = {
  NEW: "#ef4444",
  ACKNOWLEDGED: ALERT_COLORS.copper,  // 🎓 Was #60a5fa — now copper
  RESOLVED: "#22c55e",
  DISMISSED: "#6b7280",
};

const statusLabels: Record<AnomalyStatus, string> = {
  NEW: "New",
  ACKNOWLEDGED: "Acknowledged",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
};

const anomalyTypeLabels: Record<AnomalyType, string> = {
  OVER_CONSUMPTION: "Over-Consumption",
  PRICE_SPIKE: "Price Spike",
  WASTE_DAMAGE: "Waste / Damage",
};

// 🎓 Anomaly type icon — same as NotificationBell for consistency.
// These are semantic warning colors, not theme colors.
const AnomalyTypeIcon = ({ type, size = 20 }: { type: AnomalyType; size?: number }) => {
  switch (type) {
    case "OVER_CONSUMPTION":
      return <WarningAmberIcon sx={{ fontSize: size, color: "#f59e0b" }} />;
    case "PRICE_SPIKE":
      return <TrendingUpIcon sx={{ fontSize: size, color: "#ef4444" }} />;
    case "WASTE_DAMAGE":
      return <DeleteIcon sx={{ fontSize: size, color: "#f97316" }} />;
    default:
      return <ErrorIcon sx={{ fontSize: size, color: ALERT_COLORS.muted }} />;
  }
};

// ─── Filter options ─────────────────────────────────────────

const SEVERITY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Severities" },
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "OVER_CONSUMPTION", label: "Over-Consumption" },
  { value: "PRICE_SPIKE", label: "Price Spike" },
  { value: "WASTE_DAMAGE", label: "Waste / Damage" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "NEW", label: "New" },
  { value: "ACKNOWLEDGED", label: "Acknowledged" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "DISMISSED", label: "Dismissed" },
];

// ─── Date formatter ─────────────────────────────────────────
// 🎓 CRASH FIX: Type widened to accept undefined too.
// The !isoDate falsy check already catches undefined, null, and "",
// so the logic was safe — but the TYPE annotation was too narrow.
// If TypeScript sees a string|null type but gets undefined from the API,
// it could cause issues in strict mode.
const formatDate = (isoDate: string | null | undefined): string => {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Number formatter ───────────────────────────────────────
// 🎓 CRASH FIX: Changed from `=== null` (strict) to `== null` (loose).
// Loose equality catches BOTH null AND undefined — critical because
// the API may omit fields entirely (undefined) rather than sending null.
// Without this, .toLocaleString() is called on undefined → crash → blank page.
const formatNumber = (value: number | null | undefined): string => {
  if (value == null) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

// ─── Component ──────────────────────────────────────────────

const AnomalyAlertPanel = () => {
  // 🎓 NAVIGATION: useNavigate lets us close the entire panel by going back
  // to whatever page the user was on before (e.g., the main workspace).
  // Called from the "✕ Close" button in the top-right of the page header.
  const navigate = useNavigate();

  // ── Filter state ────────────────────────────────────────
  const [severity, setSeverity] = useState("");
  const [anomalyType, setAnomalyType] = useState("");
  const [status, setStatus] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 15;

  // ── Selected alert for detail view ──────────────────────
  const [selectedAlert, setSelectedAlert] = useState<AnomalyAlert | null>(null);

  // ── TanStack Query hooks ────────────────────────────────
  const { data: alertsPage, isLoading, isFetching } = useAnomalyAlerts({
    pageNumber,
    pageSize,
    severity: severity || undefined,
    anomalyType: anomalyType || undefined,
    status: status || undefined,
  });

  const updateStatusMutation = useUpdateAlertStatus();
  const fullScanMutation = useTriggerFullScan();

  // ── Event handlers ──────────────────────────────────────

  // 🎓 Status update with optimistic toast feedback.
  // After a successful status change, the detail panel closes automatically.
  // This is the common technique — once the user acts on an alert (acknowledge,
  // resolve, dismiss), they're done with it and the panel should get out of the
  // way so they can move to the next alert in the list. The query cache
  // invalidation (in the hook's onSuccess) refreshes the list simultaneously.
  const handleStatusChange = useCallback(
    (alertId: string, newStatus: AnomalyStatus) => {
      updateStatusMutation.mutate(
        { alertId, newStatus },
        {
          onSuccess: () => {
            toast.success(`Alert ${statusLabels[newStatus].toLowerCase()}`);
            // 🎓 Close the detail panel — the user is done with this alert.
            // The list auto-refreshes via query invalidation in the hook.
            if (selectedAlert?.alertId === alertId) {
              setSelectedAlert(null);
            }
          },
          onError: () => {
            toast.error("Failed to update alert status");
          },
        },
      );
    },
    [updateStatusMutation, selectedAlert],
  );

  // 🎓 Full scan trigger
  const handleFullScan = useCallback(() => {
    fullScanMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Anomaly scan completed");
      },
      onError: () => {
        toast.error("Scan failed — check server logs");
      },
    });
  }, [fullScanMutation]);

  // 🎓 Filter change resets to page 1
  const handleFilterChange = useCallback(
    (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value);
      setPageNumber(1);
    },
    [],
  );

  const alerts = alertsPage?.items ?? [];
  const totalPages = alertsPage?.totalPages ?? 0;
  const totalItems = alertsPage?.totalItems ?? 0;

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4">
      {/* ── Page header ──────────────────────────────────── */}
      {/* 🎓 COPPER: heading uses copperTextColor, subtext uses ALERT_COLORS.muted */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-lg font-semibold"
            style={{ color: ALERT_COLORS.copper }}
          >
            Anomaly Alerts
          </h1>
          <p className="text-xs mt-0.5" style={{ color: ALERT_COLORS.muted }}>
            {totalItems} alert{totalItems !== 1 ? "s" : ""} found
            {isFetching && !isLoading && " · refreshing..."}
          </p>
        </div>

        {/* 🎓 RIGHT-SIDE CONTROLS: Close button + Scan Now.
            Close navigates back to the previous page (workspace).
            Both sit in a flex row so they're neatly aligned. */}
        <div className="flex items-center gap-2">
        {/* 🎓 CLOSE ENTIRE PANEL BUTTON — copper-bordered, matches detail
            panel's close button style. Navigates back from /anomaly-alerts
            to wherever the user came from (typically the workspace). */}
        <button
          onClick={() => navigate(-1)}
          style={{
            border: `1px solid ${ALERT_COLORS.copper}`,
            color: ALERT_COLORS.copper,
            backgroundColor: "transparent",
          }}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5
                     text-xs font-medium cursor-pointer
                     transition-all duration-150
                     hover:shadow-[0_0_10px_rgba(201,128,61,0.3)]"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = ALERT_COLORS.copperLight;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
          Close
        </button>

        {/* 🎓 COPPER: "Scan Now" uses copperGlossButtonSx — the same glass-bottle
            gradient button used by AiChatFab, AiSummariseButton, and
            RagSearchPanel's send button. The <span style={{ position: "relative",
            zIndex: 1 }}> wrapper keeps the label text above the ::before/::after
            gloss overlay layers (same technique as themedButtonLabelStyle in
            workspace-theme.ts). */}
        <Tooltip title="Run anomaly scan now">
          <span>
            <Button
              onClick={handleFullScan}
              disabled={fullScanMutation.isPending}
              sx={{
                ...copperGlossButtonSx,
                borderRadius: "8px",
                padding: "6px 16px",
                minWidth: "auto",
                fontSize: "0.75rem",
                fontWeight: 600,
                "&.Mui-disabled": {
                  opacity: 0.5,
                  color: ALERT_COLORS.copperWarm,
                },
              }}
            >
              <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
                {fullScanMutation.isPending ? (
                  <CircularProgress size={16} sx={{ color: ALERT_COLORS.copperWarm }} />
                ) : (
                  <RefreshIcon sx={{ fontSize: 18 }} />
                )}
                Scan Now
              </span>
            </Button>
          </span>
        </Tooltip>
        </div>
      </div>

      {/* ── Filter bar ───────────────────────────────────── */}
      {/* 🎓 COPPER: filter selects use copper focus border instead of blue.
          Border transitions from subtle gray → copper on focus, matching the
          copper input border treatment in AiChatWindow and RagSearchPanel. */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { options: SEVERITY_OPTIONS, value: severity, setter: setSeverity, label: "Severity" },
          { options: TYPE_OPTIONS, value: anomalyType, setter: setAnomalyType, label: "Type" },
          { options: STATUS_OPTIONS, value: status, setter: setStatus, label: "Status" },
        ].map(({ options, value, setter, label }) => (
          <select
            key={label}
            value={value}
            onChange={handleFilterChange(setter)}
            style={{
              backgroundColor: ALERT_COLORS.input,
              color: ALERT_COLORS.text,
              borderColor: value ? ALERT_COLORS.copper : "rgba(255,255,255,0.1)",
            }}
            className="rounded-md border text-xs px-3 py-2
                       focus:outline-none cursor-pointer
                       transition-colors duration-150"
            onFocus={(e) => { e.currentTarget.style.borderColor = ALERT_COLORS.copper; }}
            onBlur={(e) => { if (!value) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            aria-label={`Filter by ${label}`}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      {/* ── Content area: list + detail ──────────────────── */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* ── Alert list ─────────────────────────────────── */}
        <div
          className="flex-1 rounded-lg overflow-hidden flex flex-col"
          style={{
            backgroundColor: ALERT_COLORS.surface,
            border: `1px solid ${ALERT_COLORS.border}`,
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <CircularProgress size={32} sx={{ color: ALERT_COLORS.copper }} />
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20"
                 style={{ color: ALERT_COLORS.muted }}>
              <NotificationsOffIcon />
              <p className="text-sm mt-2">No alerts match your filters</p>
              <p className="text-xs mt-1" style={{ color: ALERT_COLORS.muted }}>
                Try clicking <strong>Scan Now</strong> to detect anomalies
              </p>
            </div>
          ) : (
            <>
              {/* Alert rows */}
              <div className="flex-1 overflow-y-auto scrollbar-none">
                {alerts.map((alert) => (
                  <div
                    key={alert.alertId}
                    onClick={() => setSelectedAlert(alert)}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer
                               transition-colors duration-150"
                    style={{
                      // 🎓 COPPER: selected row gets a copper left border and
                      // copper-tinted background, matching the selectedRowHighlight
                      // pattern from workspace-theme.ts
                      borderBottom: `1px solid ${ALERT_COLORS.border}`,
                      ...(selectedAlert?.alertId === alert.alertId
                        ? {
                            backgroundColor: ALERT_COLORS.copperLight,
                            borderLeft: `3px solid ${ALERT_COLORS.copper}`,
                          }
                        : {
                            borderLeft: "3px solid transparent",
                          }
                      ),
                    }}
                    onMouseEnter={(e) => {
                      if (selectedAlert?.alertId !== alert.alertId) {
                        e.currentTarget.style.backgroundColor = "rgba(201, 128, 61, 0.08)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedAlert?.alertId !== alert.alertId) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {/* Type icon */}
                    <div className="mt-1 flex-shrink-0">
                      <AnomalyTypeIcon type={alert.anomalyType} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-medium"
                          style={{ color: ALERT_COLORS.text }}
                        >
                          {anomalyTypeLabels[alert.anomalyType]}
                        </span>
                        {/* Severity badge */}
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                          style={{
                            backgroundColor: `${severityColors[alert.severity]}20`,
                            color: severityColors[alert.severity],
                          }}
                        >
                          {alert.severity}
                        </span>
                        {/* Status badge */}
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: `${statusColors[alert.status]}20`,
                            color: statusColors[alert.status],
                          }}
                        >
                          {statusLabels[alert.status]}
                        </span>
                      </div>

                      <p className="text-xs line-clamp-1" style={{ color: ALERT_COLORS.muted }}>
                        {alert.description}
                      </p>

                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px]" style={{ color: ALERT_COLORS.muted }}>
                          Style: {alert.styleCode} · Order: {alert.order}
                        </span>
                        <span className="text-[10px]" style={{ color: "rgba(139,147,161,0.6)" }}>
                          {formatDate(alert.detectedAt)}
                        </span>
                      </div>
                    </div>

                    {/* 🎓 Quick action buttons — visible on each row.
                        COPPER: acknowledge icon uses copper instead of blue. */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {alert.status === "NEW" && (
                        <Tooltip title="Acknowledge">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(alert.alertId, "ACKNOWLEDGED");
                            }}
                            sx={{ color: ALERT_COLORS.copper, padding: "4px" }}
                          >
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(alert.status === "NEW" || alert.status === "ACKNOWLEDGED") && (
                        <>
                          <Tooltip title="Resolve">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(alert.alertId, "RESOLVED");
                              }}
                              sx={{ color: "#22c55e", padding: "4px" }}
                            >
                              <CheckIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Dismiss">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(alert.alertId, "DISMISSED");
                              }}
                              sx={{ color: "#6b7280", padding: "4px" }}
                            >
                              <CancelOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Pagination ─────────────────────────────── */}
              {/* 🎓 COPPER: pagination arrows use copper instead of blue.
                  Matches copperGlossButtonDeepSx's tone for small controls. */}
              <div
                className="flex items-center justify-between px-4 py-2 text-xs"
                style={{
                  borderTop: `1px solid ${ALERT_COLORS.border}`,
                  color: ALERT_COLORS.muted,
                }}
              >
                <span>
                  Page {pageNumber} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <IconButton
                    size="small"
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    sx={{
                      color: ALERT_COLORS.copper,
                      "&.Mui-disabled": { color: "#374151" },
                    }}
                  >
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={pageNumber >= totalPages}
                    onClick={() => setPageNumber((p) => p + 1)}
                    sx={{
                      color: ALERT_COLORS.copper,
                      "&.Mui-disabled": { color: "#374151" },
                    }}
                  >
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Detail panel (right side) ──────────────────── */}
        {/* 🎓 Only shown when an alert is selected from the list.
            Shows the full detail: deviation %, expected vs actual values,
            item description, recommended action, and lifecycle timestamps.

            🎓 CLOSE BUTTON: The close button is now PROMINENTLY visible —
            a copper-bordered "✕ Close" button in the top-right corner.
            Previously it was a tiny grey IconButton that blended into the
            dark background. Now it's impossible to miss. The user can close
            the detail panel WITHOUT taking any action (acknowledge/resolve/dismiss)
            by clicking this button. */}
        {selectedAlert && (
          <div
            className="w-[380px] flex-shrink-0 rounded-lg overflow-y-auto
                       scrollbar-none p-4 flex flex-col gap-4"
            style={{
              backgroundColor: ALERT_COLORS.surface,
              border: `1px solid ${ALERT_COLORS.border}`,
            }}
          >
            {/* 🎓 CLOSE BUTTON — copper-bordered, clearly visible.
                Uses a visible "✕ Close" text + icon combination so it's
                unmistakable. Positioned top-right of the detail panel header. */}
            <div className="flex items-center justify-between">
              <h2
                className="text-sm font-semibold"
                style={{ color: ALERT_COLORS.copper }}
              >
                Alert Detail
              </h2>
              <button
                onClick={() => setSelectedAlert(null)}
                style={{
                  border: `1px solid ${ALERT_COLORS.copper}`,
                  color: ALERT_COLORS.copper,
                  backgroundColor: "transparent",
                }}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5
                           text-xs font-medium cursor-pointer
                           transition-all duration-150
                           hover:shadow-[0_0_10px_rgba(201,128,61,0.3)]"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = ALERT_COLORS.copperLight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
                Close
              </button>
            </div>

            {/* Type + severity */}
            <div className="flex items-center gap-3">
              <AnomalyTypeIcon type={selectedAlert.anomalyType} size={24} />
              <span
                className="text-sm font-medium"
                style={{ color: ALERT_COLORS.text }}
              >
                {anomalyTypeLabels[selectedAlert.anomalyType]}
              </span>
              <span
                className="rounded px-2 py-0.5 text-xs font-bold"
                style={{
                  backgroundColor: `${severityColors[selectedAlert.severity]}20`,
                  color: severityColors[selectedAlert.severity],
                }}
              >
                {selectedAlert.severity}
              </span>
              <span
                className="rounded px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${statusColors[selectedAlert.status]}20`,
                  color: statusColors[selectedAlert.status],
                }}
              >
                {statusLabels[selectedAlert.status]}
              </span>
            </div>

            {/* Description */}
            <div>
              <label
                className="text-[10px] uppercase tracking-wider mb-1 block"
                style={{ color: ALERT_COLORS.muted }}
              >
                Description
              </label>
              <p
                className="text-xs leading-relaxed"
                style={{ color: ALERT_COLORS.text }}
              >
                {selectedAlert.description}
              </p>
            </div>

            {/* Deviation values */}
            {/* 🎓 COPPER: stat boxes have a subtle copper top-border accent
                instead of plain flat boxes. The deviation % uses the severity
                color (semantic), but the box chrome is copper-themed. */}
            {/* 🎓 CRASH FIX: Changed from `!== null` (strict) to `!= null` (loose).
                If the API returns undefined instead of null for deviationPercentage
                (e.g., JSON key missing or casing mismatch), strict !== null passes
                and the inner .toFixed(1) call crashes on undefined, killing the
                entire React render tree → blank page. Loose != catches both. */}
            {selectedAlert.deviationPercentage != null && (
              <div className="grid grid-cols-3 gap-3">
                <div
                  className="rounded-lg p-3 text-center"
                  style={{
                    backgroundColor: ALERT_COLORS.input,
                    borderTop: `2px solid ${ALERT_COLORS.copperDark}`,
                  }}
                >
                  <label
                    className="text-[10px] uppercase tracking-wider block mb-1"
                    style={{ color: ALERT_COLORS.muted }}
                  >
                    Expected
                  </label>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: ALERT_COLORS.text }}
                  >
                    {formatNumber(selectedAlert.expectedValue)}
                  </span>
                </div>
                <div
                  className="rounded-lg p-3 text-center"
                  style={{
                    backgroundColor: ALERT_COLORS.input,
                    borderTop: `2px solid ${ALERT_COLORS.copperDark}`,
                  }}
                >
                  <label
                    className="text-[10px] uppercase tracking-wider block mb-1"
                    style={{ color: ALERT_COLORS.muted }}
                  >
                    Actual
                  </label>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: ALERT_COLORS.text }}
                  >
                    {formatNumber(selectedAlert.actualValue)}
                  </span>
                </div>
                <div
                  className="rounded-lg p-3 text-center"
                  style={{
                    backgroundColor: ALERT_COLORS.input,
                    borderTop: `2px solid ${severityColors[selectedAlert.severity]}`,
                  }}
                >
                  <label
                    className="text-[10px] uppercase tracking-wider block mb-1"
                    style={{ color: ALERT_COLORS.muted }}
                  >
                    Deviation
                  </label>
                  <span
                    className="text-sm font-bold"
                    style={{ color: severityColors[selectedAlert.severity] }}
                  >
                    {/* 🎓 CRASH FIX: Optional chaining (?.) as a safety net.
                        Even though the outer != null check should prevent this,
                        belt-and-suspenders guards prevent a blank-page crash
                        if the value is somehow falsy at render time. */}
                    {selectedAlert.deviationPercentage?.toFixed(1) ?? "—"}%
                  </span>
                </div>
              </div>
            )}

            {/* Style identification */}
            <div className="grid grid-cols-2 gap-3">
              <DetailField label="Style Code" value={selectedAlert.styleCode} />
              <DetailField label="Order" value={selectedAlert.order} />
              {/* 🎓 CRASH FIX: Null coalescing so undefined renders as "—"
                  instead of the string "undefined". String(undefined) = "undefined"
                  which is technically safe but looks like a bug to the user. */}
              <DetailField label="Buyer Code" value={selectedAlert.buyerCode != null ? String(selectedAlert.buyerCode) : "—"} />
              <DetailField label="Type Code" value={selectedAlert.typeCode != null ? String(selectedAlert.typeCode) : "—"} />
            </div>

            {/* Item info */}
            {/* 🎓 CRASH FIX: itemCode can be null — guard the template literal
                so it doesn't render "Item Name (null)" to the user. */}
            {selectedAlert.itemDescription && (
              <DetailField label="Item" value={selectedAlert.itemCode ? `${selectedAlert.itemDescription} (${selectedAlert.itemCode})` : selectedAlert.itemDescription} />
            )}

            {/* Recommended action */}
            {/* 🎓 COPPER: recommended action text uses copper instead of blue,
                and the box has a copper left-edge accent bar for visual weight —
                similar to the source evidence cards in RagSearchPanel. */}
            {selectedAlert.recommendedAction && (
              <div>
                <label
                  className="text-[10px] uppercase tracking-wider mb-1 block"
                  style={{ color: ALERT_COLORS.muted }}
                >
                  Recommended Action
                </label>
                <div
                  className="rounded-lg p-3"
                  style={{
                    backgroundColor: ALERT_COLORS.input,
                    borderLeft: `3px solid ${ALERT_COLORS.copper}`,
                  }}
                >
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: ALERT_COLORS.copper }}
                  >
                    {selectedAlert.recommendedAction}
                  </p>
                </div>
              </div>
            )}

            {/* Lifecycle timestamps */}
            <div>
              <label
                className="text-[10px] uppercase tracking-wider mb-2 block"
                style={{ color: ALERT_COLORS.muted }}
              >
                Timeline
              </label>
              <div className="flex flex-col gap-1.5">
                <TimelineRow label="Detected" date={selectedAlert.detectedAt} />
                {selectedAlert.acknowledgedAt && (
                  <TimelineRow
                    label="Acknowledged"
                    date={selectedAlert.acknowledgedAt}
                    by={selectedAlert.acknowledgedBy}
                  />
                )}
                {selectedAlert.resolvedAt && (
                  <TimelineRow
                    label="Resolved"
                    date={selectedAlert.resolvedAt}
                    by={selectedAlert.resolvedBy}
                  />
                )}
              </div>
            </div>

            {/* Action buttons */}
            {/* 🎓 COPPER: the Acknowledge button uses copperGlossButtonSx — the
                glass-bottle gradient — matching the "Scan Now" button and every
                other primary action in the AI component family.
                Resolve keeps green (semantic: success/done).
                Dismiss stays muted gray (semantic: ignore/skip). */}
            {(selectedAlert.status === "NEW" || selectedAlert.status === "ACKNOWLEDGED") && (
              <div
                className="flex gap-2 pt-3"
                style={{ borderTop: `1px solid ${ALERT_COLORS.border}` }}
              >
                {selectedAlert.status === "NEW" && (
                  <Button
                    onClick={() => handleStatusChange(selectedAlert.alertId, "ACKNOWLEDGED")}
                    sx={{
                      ...copperGlossButtonSx,
                      flex: 1,
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ position: "relative", zIndex: 1 }}>
                      Acknowledge
                    </span>
                  </Button>
                )}
                <button
                  onClick={() => handleStatusChange(selectedAlert.alertId, "RESOLVED")}
                  className="flex-1 rounded-md px-3 py-2 text-xs
                             font-medium text-black
                             transition-colors duration-150 cursor-pointer"
                  style={{ backgroundColor: "#22c55e" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#4ade80"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#22c55e"; }}
                >
                  Resolve
                </button>
                <button
                  onClick={() => handleStatusChange(selectedAlert.alertId, "DISMISSED")}
                  className="flex-1 rounded-md px-3 py-2
                             text-xs font-medium cursor-pointer
                             transition-colors duration-150"
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: ALERT_COLORS.muted,
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                    e.currentTarget.style.color = ALERT_COLORS.text;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = ALERT_COLORS.muted;
                  }}
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Helper sub-components ──────────────────────────────────

// 🎓 Simple label+value field used in the detail panel.
// Uses ALERT_COLORS for consistent copper theming.
const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label
      className="text-[10px] uppercase tracking-wider block mb-0.5"
      style={{ color: ALERT_COLORS.muted }}
    >
      {label}
    </label>
    <span className="text-xs" style={{ color: ALERT_COLORS.text }}>
      {value}
    </span>
  </div>
);

// 🎓 Timeline row showing when a lifecycle event happened and who did it.
// Uses ALERT_COLORS for consistent copper theming.
const TimelineRow = ({
  label,
  date,
  by,
}: {
  label: string;
  date: string;
  by?: string | null;
}) => (
  <div className="flex items-center justify-between text-[11px]">
    <span style={{ color: ALERT_COLORS.muted }}>{label}</span>
    <span style={{ color: "rgba(139,147,161,0.7)" }}>
      {formatDate(date)}
      {by && (
        <span className="ml-1" style={{ color: "rgba(139,147,161,0.5)" }}>
          by {by}
        </span>
      )}
    </span>
  </div>
);

// 🎓 Inline icon for empty state — avoids importing a heavy MUI icon.
// Stroke uses copperTextColor so the empty-state icon matches the theme.
const NotificationsOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke={ALERT_COLORS.copper}
    strokeWidth={1.5}
    className="w-10 h-10"
    style={{ opacity: 0.5 }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.143 17.082a24.248 24.248 0 005.714 0m-6.586-2.36A11.945 11.945 0 0112 3.75c1.67 0 3.262.339 4.713.955M17.25 10.5c0 1.33.395 2.574 1.077 3.615M2.25 2.25l19.5 19.5M6.75 6.75A6.75 6.75 0 0112 3.75m5.25 6.75v1.687c0 1.15.39 2.265 1.105 3.161l.371.465M3.375 17.25h13.163"
    />
  </svg>
);

export default AnomalyAlertPanel;
