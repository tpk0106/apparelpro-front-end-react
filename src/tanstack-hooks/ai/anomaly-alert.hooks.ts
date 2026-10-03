// ─────────────────────────────────────────────────────────────────────────────
// 🎓 ANOMALY ALERT TANSTACK QUERY HOOKS
// React hooks for Phase 3: Anomaly Detection & Alerts.
//
// Follows the exact same pattern as useAiChat.ts:
//   - Query keys factory for cache management
//   - useQuery hooks for data fetching (GET endpoints)
//   - useMutation hooks for data modification (PUT/POST endpoints)
//   - Automatic cache invalidation on mutations
//
// 🎓 WHY TANSTACK QUERY?
// TanStack Query (formerly React Query) gives us:
//   - Automatic caching & deduplication (multiple components can call
//     useUnreadAlertCount and only ONE request fires)
//   - Background refetching (staleTime controls when data is considered fresh)
//   - Optimistic updates (the UI updates instantly, rolls back on error)
//   - Query invalidation (when we update a status, the list auto-refreshes)
//
// 🎓 THE refetchInterval ON UNREAD COUNT:
// We poll the unread count every 30 seconds so the bell badge stays current.
// This is a lightweight endpoint (just a COUNT(*) query), so 30s polling
// is acceptable. The alternative — WebSockets — would be over-engineering
// for a feature that doesn't need sub-second latency.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type {
  AnomalyAlert,
  AnomalyAlertSummary,
  AnomalyStatus,
  PaginatedAnomalyAlerts,
  UnreadAlertCount,
} from "../../interfaces/ai/anomaly-alert.interfaces";
import {
  getAlerts,
  getUnreadCount,
  getRecentAlerts,
  getStyleAlerts,
  updateAlertStatus,
  triggerFullScan,
  triggerStyleScan,
  type GetAlertsParams,
  type GetStyleAlertsParams,
  type ScanStyleParams,
} from "../../services/ai/anomaly-alert.service";

// ─── Query keys factory ──────────────────────────────────────
// 🎓 Centralised query keys prevent typo bugs and make invalidation precise.
// The hierarchical structure means invalidating anomalyAlertKeys.all
// also invalidates every sub-key (list, unread, recent, style).

export const anomalyAlertKeys = {
  /** Root key — invalidate this to refresh ALL anomaly alert queries */
  all: ["anomaly-alerts"] as const,

  /** Paginated alert list — includes filter params so different filters cache separately */
  list: (params: GetAlertsParams) =>
    [...anomalyAlertKeys.all, "list", params] as const,

  /** Unread count — used by the notification bell badge */
  unreadCount: () => [...anomalyAlertKeys.all, "unread-count"] as const,

  /** Recent alerts — compact summaries for the bell dropdown */
  recent: () => [...anomalyAlertKeys.all, "recent"] as const,

  /** Style-specific alerts — keyed by the composite style identifier */
  style: (params: GetStyleAlertsParams) =>
    [...anomalyAlertKeys.all, "style", params] as const,
};

// ─── Paginated alerts list (query) ───────────────────────────
// 🎓 Used by the AnomalyAlertPanel to show the full filterable list.
// staleTime: 30s means we won't re-fetch if the user switches tabs
// and comes back within 30 seconds — reduces unnecessary API calls.

export const useAnomalyAlerts = (
  params: GetAlertsParams = {},
  enabled: boolean = true,
): UseQueryResult<PaginatedAnomalyAlerts, AppError> => {
  return useQuery<PaginatedAnomalyAlerts, AppError>({
    queryKey: anomalyAlertKeys.list(params),
    queryFn: async () => {
      const response: AxiosResponse<PaginatedAnomalyAlerts> =
        await getAlerts(params);
      return response.data;
    },
    enabled,
    staleTime: 30_000,
  });
};

// ─── Unread count (query with polling) ───────────────────────
// 🎓 This is the ONLY hook that uses refetchInterval.
// It polls every 30 seconds so the bell badge number stays fresh.
// The endpoint is extremely lightweight (single COUNT query), so
// this polling frequency is fine even with many concurrent users.

export const useUnreadAlertCount = (
  enabled: boolean = true,
): UseQueryResult<number, AppError> => {
  return useQuery<number, AppError>({
    queryKey: anomalyAlertKeys.unreadCount(),
    queryFn: async () => {
      const response: AxiosResponse<UnreadAlertCount> =
        await getUnreadCount();
      return response.data.count;
    },
    enabled,
    staleTime: 15_000,
    // 🎓 Poll every 30 seconds to keep the badge current.
    // refetchInterval only fires when the tab is focused (default behaviour),
    // so it won't waste bandwidth when the user is on another tab.
    refetchInterval: 30_000,
  });
};

// ─── Recent alerts for bell dropdown (query) ─────────────────
// 🎓 Returns the latest ~10 alerts as compact summaries.
// Only fetched when the bell dropdown is opened (enabled param).

export const useRecentAlerts = (
  enabled: boolean = true,
): UseQueryResult<AnomalyAlertSummary[], AppError> => {
  return useQuery<AnomalyAlertSummary[], AppError>({
    queryKey: anomalyAlertKeys.recent(),
    queryFn: async () => {
      const response: AxiosResponse<AnomalyAlertSummary[]> =
        await getRecentAlerts();
      return response.data;
    },
    enabled,
    staleTime: 15_000,
  });
};

// ─── Style-specific alerts (query) ───────────────────────────
// 🎓 Used when viewing a specific style's detail page to show
// any active anomaly alerts for that style. Typically few results
// per style, so no pagination needed.

export const useStyleAlerts = (
  params: GetStyleAlertsParams | null,
): UseQueryResult<AnomalyAlert[], AppError> => {
  return useQuery<AnomalyAlert[], AppError>({
    queryKey: anomalyAlertKeys.style(params!),
    queryFn: async () => {
      const response: AxiosResponse<AnomalyAlert[]> =
        await getStyleAlerts(params!);
      return response.data;
    },
    // 🎓 Only fetch when we have valid style params — null means
    // no style is selected yet, so the query stays disabled.
    enabled: !!params,
    staleTime: 30_000,
  });
};

// ─── Update alert status (mutation) ──────────────────────────
// 🎓 Called when a merchandiser clicks Acknowledge, Resolve, or Dismiss.
// On success, we invalidate all anomaly queries so the list, count,
// and recent summaries all refresh to reflect the status change.

export const useUpdateAlertStatus = (): UseMutationResult<
  void,
  AppError,
  { alertId: string; newStatus: AnomalyStatus }
> => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AppError,
    { alertId: string; newStatus: AnomalyStatus }
  >({
    mutationFn: async ({ alertId, newStatus }) => {
      await updateAlertStatus(alertId, { newStatus });
    },
    onSuccess: () => {
      // 🎓 Invalidate ALL anomaly alert queries at once.
      // This is simpler than surgically invalidating individual keys,
      // and since the queries are lightweight, the cost is negligible.
      queryClient.invalidateQueries({ queryKey: anomalyAlertKeys.all });
    },
  });
};

// ─── Trigger full scan (mutation) ────────────────────────────
// 🎓 Manual "Scan Now" button — kicks off a full anomaly detection
// run across all active styles. On success, we invalidate the queries
// so any newly created alerts appear immediately.

export const useTriggerFullScan = (): UseMutationResult<
  void,
  AppError,
  void
> => {
  const queryClient = useQueryClient();

  return useMutation<void, AppError, void>({
    mutationFn: async () => {
      await triggerFullScan();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: anomalyAlertKeys.all });
    },
  });
};

// ─── Trigger style-specific scan (mutation) ──────────────────
// 🎓 Targeted scan for a single style — faster than a full scan.
// Useful when a merchandiser wants to check one style immediately
// after making consumption changes.

export const useTriggerStyleScan = (): UseMutationResult<
  void,
  AppError,
  ScanStyleParams
> => {
  const queryClient = useQueryClient();

  return useMutation<void, AppError, ScanStyleParams>({
    mutationFn: async (params) => {
      await triggerStyleScan(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: anomalyAlertKeys.all });
    },
  });
};
