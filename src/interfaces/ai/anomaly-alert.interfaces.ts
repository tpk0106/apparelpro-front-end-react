// ─────────────────────────────────────────────────────────────────────────────
// 🎓 ANOMALY ALERT INTERFACES
// TypeScript type definitions for Phase 3: Anomaly Detection & Alerts.
//
// These mirror the C# API models:
//   - AnomalyAlertAPIModel      → AnomalyAlert (full detail)
//   - AnomalyAlertSummaryAPIModel → AnomalyAlertSummary (bell dropdown)
//   - UpdateAlertStatusAPIModel   → UpdateAlertStatusRequest (status change)
//
// 🎓 WHY SEPARATE INTERFACES FOR FULL vs SUMMARY?
// The bell dropdown only needs a compact view (type, severity, description).
// The full alert panel needs everything (deviation %, expected/actual values,
// recommended action). Using separate types keeps the bell's network payload
// small and the panel's display rich — same API endpoint, different projections.
// ─────────────────────────────────────────────────────────────────────────────

// ── Enum-like union types ─────────────────────────────────────────────────
// 🎓 TypeScript string literal unions give us compile-time safety without
// needing actual enums. These match the C# enum string values exactly.

export type AnomalyType = "OVER_CONSUMPTION" | "PRICE_SPIKE" | "WASTE_DAMAGE";

export type AnomalySeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type AnomalyStatus = "NEW" | "ACKNOWLEDGED" | "RESOLVED" | "DISMISSED";

// ── Full alert (for the alert panel / detail view) ────────────────────────
// 🎓 Maps to AnomalyAlertAPIModel on the backend.
// Contains every field the detection engine produces — used in the
// expanded alert panel where merchandisers review and act on anomalies.

export interface AnomalyAlert {
  alertId: string;                  // Guid → string in JSON
  anomalyType: AnomalyType;
  severity: AnomalySeverity;
  status: AnomalyStatus;

  // ── Style composite key ───────────────────────────────────
  // 🎓 These four fields identify which style the anomaly belongs to.
  // Same composite key pattern used throughout ApparelPro:
  //   BuyerCode / Order / TypeCode / StyleCode
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;

  // ── Item identification ───────────────────────────────────
  // 🎓 ItemCode is the 22-char composite: StockCode(2) + ItemCode(4) + Feature1-4(4 each)
  // ItemDescription is the human-readable name (e.g., "Cotton Jersey 180GSM")
  itemCode: string | null;
  itemDescription: string | null;

  // ── Detection values ──────────────────────────────────────
  // 🎓 These let the merchandiser understand WHAT triggered the alert:
  //   - expectedValue: what the system expected (planned consumption, avg price, etc.)
  //   - actualValue: what was actually recorded
  //   - deviationPercentage: how far off (e.g., 25.3% over-consumption)
  expectedValue: number | null;
  actualValue: number | null;
  deviationPercentage: number | null;

  // ── Human-readable explanation ────────────────────────────
  // 🎓 Pre-built by the detection engine — ready to display as-is.
  // Example: "Fabric Cotton Jersey consumed 9,712 yds vs planned 7,500 yds (29.5% over)"
  description: string;
  recommendedAction: string | null;

  // ── Lifecycle timestamps ──────────────────────────────────
  detectedAt: string;               // ISO 8601 datetime string
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  acknowledgedBy: string | null;
  resolvedBy: string | null;
}

// ── Compact summary (for the notification bell dropdown) ──────────────────
// 🎓 Maps to AnomalyAlertSummaryAPIModel on the backend.
// Deliberately lightweight — the bell dropdown shows a quick list, not full detail.

export interface AnomalyAlertSummary {
  alertId: string;
  anomalyType: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  styleCode: string;
  order: string;
  detectedAt: string;
}

// ── Paginated alert list response ────────────────────────────────────────
// 🎓 Same PaginationAPIModel<T> pattern used throughout the app
// (matches the C# PaginationAPIModel generic wrapper).

export interface PaginatedAnomalyAlerts {
  items: AnomalyAlert[];
  pageSize: number;
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// ── Status update request ────────────────────────────────────────────────
// 🎓 Maps to UpdateAlertStatusAPIModel on the backend.
// The userId is extracted from the JWT token server-side — we don't send it.

export interface UpdateAlertStatusRequest {
  newStatus: AnomalyStatus;
}

// ── Unread count response ────────────────────────────────────────────────
// 🎓 Simple wrapper for the GET /api/anomaly/alerts/unread-count endpoint.
// Returns just a number — how many NEW alerts exist (for the bell badge).

export interface UnreadAlertCount {
  count: number;
}
