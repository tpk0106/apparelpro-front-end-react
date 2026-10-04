// ─────────────────────────────────────────────────────────────────────────────
// 🎓 CROSS-ENTITY ANALYTICS SERVICE
// API service layer for Phase 2, Feature 1: Cross-Entity Analytics.
//
// Follows the exact same pattern as anomaly-alert.service.ts:
//   - Import the authenticated axios client (handles JWT token automatically)
//   - Import endpoint constants from api-configurations
//   - Export typed async functions that call the backend
//
// 🎓 WHY A SEPARATE SERVICE FILE?
// Separation of Concerns (SoC): the service layer knows HOW to call the API
// (HTTP method, URL, request body). The TanStack hooks layer
// (cross-entity-analytics.hooks.ts) knows WHEN to call it (query keys,
// stale times, cache invalidation). Components just consume the hooks —
// they never see axios or URLs.
//
// 🎓 ENDPOINT MAPPING:
//   runAnalytics()   → POST /api/ai/analytics
//   getCategories()  → GET  /api/ai/analytics/categories
// ─────────────────────────────────────────────────────────────────────────────

import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  CrossEntityAnalyticsRequest,
  CrossEntityAnalyticsResponse,
  AnalyticsCategoryInfo,
} from "../../interfaces/ai/cross-entity-analytics.interfaces";

// ─── Service functions ───────────────────────────────────────

// 🎓 POST /api/ai/analytics — Run a cross-entity analytics analysis.
// Maps to CrossEntityAnalyticsController.RunAnalyticsAsync().
//
// 🎓 WHY POST (not GET)?
// This endpoint triggers a COMPUTATION — it aggregates data from multiple
// tables, builds an AI prompt, and calls the AI provider. That's a side-effect
// (uses AI tokens, takes 5-15 seconds), not a simple data retrieval.
// POST is the correct HTTP verb for operations that trigger processing.
//
// 🎓 REQUEST BODY:
//   { category: "MATERIAL_CONSUMPTION", userQuery?: "Which styles have high wastage?" }
//
// 🎓 RESPONSE:
//   { analysis: "...", category: "...", entityCount: 47, provider: "Anthropic",
//     model: "...", inputTokens: ..., outputTokens: ..., totalTokens: ...,
//     estimatedCost: ..., generatedAt: "..." }
const runAnalytics = async (request: CrossEntityAnalyticsRequest) => {
  // 🎓 EXTENDED TIMEOUT — Analytics calls are expensive AI operations that
  // aggregate data from multiple EF Core tables, build a large prompt, and
  // wait for the AI provider to generate a full strategic analysis.
  // The global axiosClient sets timeout: 30000 (30s) in axios.create(),
  // which is too short — analytics calls routinely take 15-60+ seconds.
  //
  // 🎓 WHY AbortController + signal?
  // In some axios versions, per-request `timeout` in the config object
  // doesn't reliably override the instance-level timeout set in
  // axios.create(). Using AbortController with setTimeout gives us
  // an iron-clad 2-minute window that works regardless of axios internals.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000); // 🎓 2 minutes

  try {
    return await client.post<CrossEntityAnalyticsResponse>(
      APPARELPRO_ENDPOINTS.AI.ANALYTICS.RUN,
      request,
      {
        timeout: 120_000,       // 🎓 Request-level override (works in axios ≥1.x)
        signal: controller.signal, // 🎓 Fallback: AbortController cancels after 2 min
      },
    );
  } finally {
    clearTimeout(timeoutId); // 🎓 Clean up the timer if request completes before 2 min
  }
};

// 🎓 GET /api/ai/analytics/categories — List supported analytics categories.
// Maps to CrossEntityAnalyticsController.GetCategories().
//
// 🎓 WHY FETCH CATEGORIES FROM THE BACKEND?
// Instead of hardcoding the 5 categories in the frontend, we fetch them
// from the backend so the list stays in sync. If a new category is added
// to AnalyticsPromptTemplates.cs and the controller, the frontend dropdown
// automatically picks it up without a frontend deploy.
//
// 🎓 RESPONSE:
//   [{ key: "MATERIAL_CONSUMPTION", name: "Material Consumption",
//      description: "Analyse consumption patterns..." }, ...]
const getCategories = async () => {
  return await client.get<AnalyticsCategoryInfo[]>(
    APPARELPRO_ENDPOINTS.AI.ANALYTICS.CATEGORIES,
  );
};

export { runAnalytics, getCategories };
