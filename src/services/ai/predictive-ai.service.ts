// ─────────────────────────────────────────────────────────────────────────────
// 🎓 PREDICTIVE AI SERVICE
// API service layer for Phase 5: Predictive & Prescriptive AI.
//
// Follows the exact same pattern as cross-entity-analytics.service.ts:
//   - Import the authenticated axios client (handles JWT token automatically)
//   - Import endpoint constants from api-configurations
//   - Export typed async functions that call the backend
//
// 🎓 ENDPOINT MAPPING:
//   runPrediction()       → POST /api/ai/predictions
//   getPredictionCategories() → GET  /api/ai/predictions/categories
//
// 🎓 WHY THE SAME AbortController PATTERN?
// Predictions are even heavier than analytics — the service aggregates
// historical data, computes trend signals (velocities, risk scores, ratios),
// and then the AI generates forward-looking forecasts. This can easily take
// 30-90 seconds, so the same 2-minute AbortController timeout applies.
// ─────────────────────────────────────────────────────────────────────────────

import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  PredictiveAiRequest,
  PredictiveAiResponse,
  PredictionCategoryInfo,
} from "../../interfaces/ai/predictive-ai.interfaces";

// ─── Service functions ───────────────────────────────────────

// 🎓 POST /api/ai/predictions — Run a predictive analysis.
// Maps to PredictiveAiController.RunPredictionAsync().
//
// 🎓 WHY POST (not GET)?
// Same reason as analytics — this triggers a heavyweight computation:
//   1. Aggregates historical data from EF Core (orders, styles, suppliers)
//   2. Computes trend signals (order velocity, shortage indicators, risk scores)
//   3. Builds a category-specific prompt from PredictivePromptTemplates
//   4. Calls the AI provider for forward-looking predictions
// That's expensive processing with side-effects (AI token cost), not a
// simple data retrieval.
//
// 🎓 REQUEST BODY:
//   { category: "DEMAND_FORECASTING", userQuery?: "...", timeHorizonMonths?: 6 }
//
// 🎓 RESPONSE:
//   { prediction: "...", category: "...", entityCount: 47, timeHorizonMonths: 6,
//     provider: "Anthropic", model: "...", inputTokens: ..., outputTokens: ...,
//     totalTokens: ..., estimatedCost: ..., generatedAt: "..." }
const runPrediction = async (request: PredictiveAiRequest) => {
  // 🎓 EXTENDED TIMEOUT — Prediction calls are even heavier than analytics:
  // they aggregate historical data, compute trend signals (velocities, ratios,
  // risk scores) in C# before sending to the AI, and the AI then generates
  // forward-looking forecasts with action recommendations.
  //
  // 🎓 WHY AbortController + signal?
  // Same pattern as cross-entity-analytics.service.ts:
  // In some axios versions, per-request `timeout` in the config object
  // doesn't reliably override the instance-level timeout set in
  // axios.create(). Using AbortController with setTimeout gives us
  // an iron-clad 2-minute window that works regardless of axios internals.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000); // 🎓 2 minutes

  try {
    return await client.post<PredictiveAiResponse>(
      APPARELPRO_ENDPOINTS.AI.PREDICTIONS.RUN,
      request,
      {
        timeout: 120_000,          // 🎓 Request-level override (works in axios ≥1.x)
        signal: controller.signal, // 🎓 Fallback: AbortController cancels after 2 min
      },
    );
  } finally {
    clearTimeout(timeoutId); // 🎓 Clean up the timer if request completes before 2 min
  }
};

// 🎓 GET /api/ai/predictions/categories — List supported prediction categories.
// Maps to PredictiveAiController.GetCategories().
//
// 🎓 WHY FETCH FROM THE BACKEND?
// Same philosophy as analytics — the frontend doesn't hardcode the 4
// categories. If a new prediction category is added on the backend (e.g.
// LEAD_TIME_PREDICTION), the frontend automatically picks it up without
// requiring a frontend deploy.
//
// 🎓 RESPONSE:
//   [{ key: "DEMAND_FORECASTING", name: "Demand Forecasting",
//      description: "Predict future order quantities...",
//      iconHint: "TrendingUp" }, ...]
const getPredictionCategories = async () => {
  return await client.get<PredictionCategoryInfo[]>(
    APPARELPRO_ENDPOINTS.AI.PREDICTIONS.CATEGORIES,
  );
};

export { runPrediction, getPredictionCategories };
