// ─────────────────────────────────────────────────────────────────────────────
// 🎓 CROSS-ENTITY ANALYTICS TANSTACK QUERY HOOKS
// React hooks for Phase 2, Feature 1: Cross-Entity Analytics.
//
// Follows the exact same pattern as anomaly-alert.hooks.ts:
//   - Query keys factory for cache management
//   - useQuery hook for the categories list (GET endpoint)
//   - useMutation hook for running analytics (POST endpoint)
//
// 🎓 KEY DIFFERENCE FROM ANOMALY HOOKS:
// Anomaly hooks are mostly useQuery (fetching alert lists, counts, etc.)
// with a few mutations (status update, scan trigger). Analytics hooks are
// the opposite: the main action is a useMutation (POST to run analysis)
// because each analytics run is an expensive AI call, not a simple data fetch.
// The only useQuery is for the lightweight categories list.
//
// 🎓 WHY useMutation FOR ANALYTICS (not useQuery)?
// useQuery is for idempotent data fetching — it auto-refetches on focus,
// retries on error, and caches results. An analytics run:
//   - Costs AI tokens (not idempotent — each call has a cost)
//   - Takes 5-15 seconds (too slow for background refetching)
//   - Should only fire when the user explicitly clicks "Run Analysis"
// useMutation gives us manual control: it only fires on mutate(),
// never auto-refetches, and provides loading/error/success states.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useMutation,
  useQuery,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type {
  AnalyticsCategoryInfo,
  CrossEntityAnalyticsRequest,
  CrossEntityAnalyticsResponse,
} from "../../interfaces/ai/cross-entity-analytics.interfaces";
import {
  runAnalytics,
  getCategories,
} from "../../services/ai/cross-entity-analytics.service";

// ─── Query keys factory ──────────────────────────────────────
// 🎓 Centralised query keys prevent typo bugs and make invalidation precise.
// Analytics has fewer keys than anomaly alerts because there's only one
// query (categories) — the analytics run itself is a mutation, not a query.

export const analyticsKeys = {
  /** Root key — invalidate this to refresh ALL analytics queries */
  all: ["cross-entity-analytics"] as const,

  /** Categories list — static data, rarely changes */
  categories: () => [...analyticsKeys.all, "categories"] as const,
};

// ─── Categories list (query) ────────────────────────────────
// 🎓 Fetches the list of supported analytics categories from the backend.
// Used to populate the category selector dropdown in the panel.
//
// 🎓 staleTime: 5 MINUTES (300_000ms) — WHY SO LONG?
// Categories are essentially static data — they only change when a developer
// adds a new category to AnalyticsPromptTemplates.cs and deploys. There's no
// reason to re-fetch this list every 30 seconds like we do with unread alerts.
// 5 minutes is generous; we could even use Infinity here.

export const useAnalyticsCategories = (
  enabled: boolean = true,
): UseQueryResult<AnalyticsCategoryInfo[], AppError> => {
  return useQuery<AnalyticsCategoryInfo[], AppError>({
    queryKey: analyticsKeys.categories(),
    queryFn: async () => {
      const response: AxiosResponse<AnalyticsCategoryInfo[]> =
        await getCategories();
      return response.data;
    },
    enabled,
    staleTime: 300_000, // 🎓 5 minutes — categories rarely change
  });
};

// ─── Run analytics (mutation) ────────────────────────────────
// 🎓 The main hook — triggers a cross-entity analytics run.
// Called when the user selects a category and clicks "Run Analysis".
//
// 🎓 WHY NO onSuccess INVALIDATION?
// Unlike useUpdateAlertStatus (which invalidates the alert list so it
// refreshes), running analytics doesn't change any server-side data.
// It's a read-only computation that returns a result. The result is
// consumed directly from the mutation's `data` field — no cache to update.
//
// 🎓 USAGE IN THE COMPONENT:
//   const { mutate, data, isPending, isError, error } = useRunAnalytics();
//   mutate({ category: "MATERIAL_CONSUMPTION", userQuery: "..." });
//   // data?.analysis contains the AI-generated text when isPending is false

export const useRunAnalytics = (): UseMutationResult<
  CrossEntityAnalyticsResponse,
  AppError,
  CrossEntityAnalyticsRequest
> => {
  return useMutation<
    CrossEntityAnalyticsResponse,
    AppError,
    CrossEntityAnalyticsRequest
  >({
    mutationFn: async (request) => {
      const response: AxiosResponse<CrossEntityAnalyticsResponse> =
        await runAnalytics(request);
      return response.data;
    },
  });
};
