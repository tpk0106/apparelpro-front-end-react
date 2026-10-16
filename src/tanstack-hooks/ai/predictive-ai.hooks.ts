// ─────────────────────────────────────────────────────────────────────────────
// 🎓 PREDICTIVE AI TANSTACK QUERY HOOKS
// React hooks for Phase 5: Predictive & Prescriptive AI.
//
// Follows the exact same pattern as cross-entity-analytics.hooks.ts:
//   - Query keys factory for cache management
//   - useQuery hook for the categories list (GET endpoint)
//   - useMutation hook for running predictions (POST endpoint)
//
// 🎓 WHY THE SAME PATTERN AS ANALYTICS HOOKS?
// Both features share the same interaction model:
//   - A lightweight GET to fetch the category list (useQuery, cached)
//   - An expensive POST to run an AI analysis/prediction (useMutation, manual)
// The only difference is the types and endpoints — the hook structure is
// identical because the UI interaction pattern is identical.
//
// 🎓 USAGE IN THE DASHBOARD COMPONENT:
//   const { data: categories } = usePredictionCategories();
//   const { mutate, data, isPending, isError, error } = useRunPrediction();
//   mutate({ category: "DEMAND_FORECASTING", timeHorizonMonths: 6 });
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
  PredictionCategoryInfo,
  PredictiveAiRequest,
  PredictiveAiResponse,
} from "../../interfaces/ai/predictive-ai.interfaces";
import {
  runPrediction,
  getPredictionCategories,
} from "../../services/ai/predictive-ai.service";

// ─── Query keys factory ──────────────────────────────────────
// 🎓 Centralised query keys prevent typo bugs and make invalidation precise.
// Same pattern as analyticsKeys — predictions have one query (categories)
// and one mutation (run prediction). The mutation doesn't need a query key
// because useMutation doesn't use the query cache.

export const predictionKeys = {
  /** Root key — invalidate this to refresh ALL prediction queries */
  all: ["predictive-ai"] as const,

  /** Categories list — static data, rarely changes */
  categories: () => [...predictionKeys.all, "categories"] as const,
};

// ─── Categories list (query) ────────────────────────────────
// 🎓 Fetches the list of supported prediction categories from the backend.
// Used to populate the category selector cards in the Predictions Dashboard.
//
// 🎓 staleTime: 5 MINUTES (300_000ms)
// Same reasoning as analytics categories — prediction categories are
// essentially static data that only change when a developer adds a new
// prediction type and deploys. No reason to re-fetch frequently.
//
// 🎓 RESPONSE INCLUDES iconHint:
// Each category has an iconHint string (e.g. "TrendingUp", "Shield") that
// the dashboard component maps to the corresponding MUI icon. This is
// different from analytics categories which don't have icon hints.

export const usePredictionCategories = (
  enabled: boolean = true,
): UseQueryResult<PredictionCategoryInfo[], AppError> => {
  return useQuery<PredictionCategoryInfo[], AppError>({
    queryKey: predictionKeys.categories(),
    queryFn: async () => {
      const response: AxiosResponse<PredictionCategoryInfo[]> =
        await getPredictionCategories();
      return response.data;
    },
    enabled,
    staleTime: 300_000, // 🎓 5 minutes — categories rarely change
  });
};

// ─── Run prediction (mutation) ──────────────────────────────
// 🎓 The main hook — triggers a predictive AI run.
// Called when the user selects a category, sets the time horizon slider,
// and clicks "Run Prediction".
//
// 🎓 WHY useMutation (same reasoning as analytics):
//   - Costs AI tokens (not idempotent — each call has a monetary cost)
//   - Takes 15-60+ seconds (too slow for auto-refetching)
//   - Should only fire when the user explicitly clicks the button
//   - useMutation gives manual control: fires only on mutate(),
//     never auto-refetches, and provides loading/error/success states
//
// 🎓 USAGE:
//   const { mutate, data, isPending, isError, error } = useRunPrediction();
//   mutate({
//     category: "DEMAND_FORECASTING",
//     timeHorizonMonths: 6,
//     userQuery: "Focus on buyer ALPHA"
//   });
//   // data?.prediction contains the AI-generated forecast when done

export const useRunPrediction = (): UseMutationResult<
  PredictiveAiResponse,
  AppError,
  PredictiveAiRequest
> => {
  return useMutation<
    PredictiveAiResponse,
    AppError,
    PredictiveAiRequest
  >({
    mutationFn: async (request) => {
      const response: AxiosResponse<PredictiveAiResponse> =
        await runPrediction(request);
      return response.data;
    },
  });
};
