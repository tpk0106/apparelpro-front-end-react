// ─────────────────────────────────────────────────────────────────────────────
// 🎓 ANOMALY ALERT SERVICE
// API service layer for Phase 3: Anomaly Detection & Alerts.
//
// Follows the exact same pattern as ai-chat.service.ts:
//   - Import the authenticated axios client (handles JWT token automatically)
//   - Import endpoint constants from api-configurations
//   - Export typed async functions that call the backend
//
// 🎓 WHY A SEPARATE SERVICE FILE?
// Separation of Concerns (SoC): the service layer knows HOW to call the API
// (HTTP method, URL, params). The TanStack hooks layer (anomaly-alert.hooks.ts)
// knows WHEN to call it (query keys, stale times, cache invalidation).
// Components just consume the hooks — they never see axios or URLs.
// ─────────────────────────────────────────────────────────────────────────────

import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  AnomalyAlert,
  AnomalyAlertSummary,
  PaginatedAnomalyAlerts,
  UpdateAlertStatusRequest,
  UnreadAlertCount,
} from "../../interfaces/ai/anomaly-alert.interfaces";

// ─── Query parameters ────────────────────────────────────────
// 🎓 These match the [FromQuery] parameters on AnomalyAlertController endpoints.
// Using an explicit interface instead of inline params keeps the service
// signature clean and lets the hooks pass a single object.

export interface GetAlertsParams {
  pageNumber?: number;
  pageSize?: number;
  severity?: string;
  anomalyType?: string;
  status?: string;
}

export interface GetStyleAlertsParams {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
}

export interface ScanStyleParams {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
}

// ─── Service functions ───────────────────────────────────────

// 🎓 GET /api/anomaly/alerts — Paginated list with optional filters.
// Maps to AnomalyAlertController.GetAlertsAsync().
// The backend returns PaginationAPIModel<AnomalyAlertAPIModel> which
// our TypeScript interface PaginatedAnomalyAlerts mirrors exactly.
//
// 🎓 PARAM NAME MAPPING (frontend → backend):
// The React filter state uses short names (severity, anomalyType, status)
// but the C# controller's [FromQuery] parameters use "Filter" suffix:
//   severity    → severityFilter
//   anomalyType → anomalyTypeFilter
//   status      → statusFilter
// This mapping happens HERE in the service layer so the hooks and
// components don't need to know about backend naming conventions.
const getAlerts = async (params: GetAlertsParams = {}) => {
  return await client.get<PaginatedAnomalyAlerts>(
    APPARELPRO_ENDPOINTS.AI.ANOMALY.LIST,
    {
      params: {
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 20,
        // 🎓 Map frontend names → backend [FromQuery] parameter names
        severityFilter: params.severity,
        anomalyTypeFilter: params.anomalyType,
        statusFilter: params.status,
      },
    },
  );
};

// 🎓 GET /api/anomaly/alerts/unread-count — How many NEW alerts exist.
// Returns { count: number } — used by the NotificationBell badge.
// This is a lightweight endpoint that just does COUNT(*) WHERE Status = 'NEW',
// so it's safe to poll frequently (every 30 seconds).
const getUnreadCount = async () => {
  return await client.get<UnreadAlertCount>(
    APPARELPRO_ENDPOINTS.AI.ANOMALY.UNREAD_COUNT,
  );
};

// 🎓 GET /api/anomaly/alerts/recent — Latest alerts as compact summaries.
// Returns AnomalyAlertSummary[] — the lightweight projection used in
// the notification bell dropdown. No pagination needed here because the
// backend caps it to the 10 most recent.
const getRecentAlerts = async () => {
  return await client.get<AnomalyAlertSummary[]>(
    APPARELPRO_ENDPOINTS.AI.ANOMALY.RECENT,
  );
};

// 🎓 GET /api/anomaly/alerts/style — Alerts for a specific style.
// Uses the composite key (buyerCode/order/typeCode/styleCode) that
// identifies a style throughout ApparelPro.
// Returns AnomalyAlert[] (full detail, not paginated — typically few per style).
const getStyleAlerts = async (params: GetStyleAlertsParams) => {
  return await client.get<AnomalyAlert[]>(
    APPARELPRO_ENDPOINTS.AI.ANOMALY.BY_STYLE,
    {
      params: {
        buyerCode: params.buyerCode,
        order: params.order,
        typeCode: params.typeCode,
        styleCode: params.styleCode,
      },
    },
  );
};

// 🎓 PUT /api/anomaly/alerts/{alertId}/status — Update alert status.
// Maps to AnomalyAlertController.UpdateAlertStatusAsync().
// The backend extracts the user identity from the JWT token to record
// who acknowledged/resolved/dismissed the alert — we don't send userId.
const updateAlertStatus = async (
  alertId: string,
  request: UpdateAlertStatusRequest,
) => {
  return await client.put(
    `${APPARELPRO_ENDPOINTS.AI.ANOMALY.UPDATE_STATUS}/${alertId}/status`,
    request,
  );
};

// 🎓 POST /api/anomaly/scan — Trigger a full anomaly scan.
// Maps to AnomalyAlertController.TriggerFullScanAsync().
// This is the manual "scan now" button — the background job runs
// automatically every 30 minutes, but merchandisers can trigger
// an immediate scan when they want fresh results.
const triggerFullScan = async () => {
  return await client.post(
    APPARELPRO_ENDPOINTS.AI.ANOMALY.SCAN,
  );
};

// 🎓 POST /api/anomaly/scan/style — Trigger a targeted scan for one style.
// Maps to AnomalyAlertController.TriggerStyleScanAsync().
// More efficient than a full scan when you only care about one style.
const triggerStyleScan = async (params: ScanStyleParams) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.AI.ANOMALY.SCAN_STYLE,
    params,
  );
};

export {
  getAlerts,
  getUnreadCount,
  getRecentAlerts,
  getStyleAlerts,
  updateAlertStatus,
  triggerFullScan,
  triggerStyleScan,
};
