// ─────────────────────────────────────────────────────────────────────────────
// 🎓 PREDICTIVE AI INTERFACES
// TypeScript type definitions for Phase 5: Predictive & Prescriptive AI.
//
// These mirror the C# API models in ApparelPro.AI.Models:
//   - PredictiveAiAPIModel            → PredictiveAiRequest (POST body)
//   - PredictiveAiAPIModel_Response   → PredictiveAiResponse
//   - PredictionCategoryInfo          → PredictionCategoryInfo (GET /categories)
//
// 🎓 HOW THESE DIFFER FROM CROSS-ENTITY ANALYTICS INTERFACES:
// Analytics interfaces have: analysis (string), category, entityCount.
// Predictive interfaces have: prediction (string), category, entityCount,
// PLUS timeHorizonMonths — the forecast window the user selected via the
// slider (1-12 months). This extra dimension is what makes predictions
// forward-looking rather than backward-looking.
//
// 🎓 WHY A SEPARATE FILE (not adding to cross-entity-analytics.interfaces.ts)?
// Same pattern as every other AI feature — each feature gets its own
// interfaces file in src/interfaces/ai/. This keeps imports clean and makes
// it obvious which types belong to which feature.
// ─────────────────────────────────────────────────────────────────────────────

// ── Prediction category union type ──────────────────────────────────────────
// 🎓 Matches the 4 categories defined in PredictivePromptTemplates.cs on the
// backend. Using a string literal union gives us compile-time safety — if we
// typo a category name, TypeScript catches it before runtime.
//
// 🎓 THESE ARE DIFFERENT FROM AnalyticsCategory:
//   Analytics: MATERIAL_CONSUMPTION, SUPPLIER_PERFORMANCE, BUYER_PORTFOLIO,
//              ORDER_PIPELINE, COST_ANALYSIS (5 backward-looking)
//   Predictive: DEMAND_FORECASTING, MATERIAL_SHORTAGE, SUPPLIER_RISK,
//               COST_OPTIMIZATION (4 forward-looking)

export type PredictionCategory =
  | "DEMAND_FORECASTING"
  | "MATERIAL_SHORTAGE"
  | "SUPPLIER_RISK"
  | "COST_OPTIMIZATION";

// ── Request model ────────────────────────────────────────────────────────────
// 🎓 Maps to PredictiveAiAPIModel on the backend.
// POST /api/ai/predictions expects this shape.
//
// category:          Required — which prediction dimension to forecast.
// userQuery:         Optional — a follow-up question appended to the AI prompt.
//                    e.g. "Focus on buyer ALPHA's demand for next quarter."
// timeHorizonMonths: Optional — how far ahead to predict (1-12 months).
//                    Default is 3 months on the backend if not provided.
//                    The slider in the frontend controls this value.

export interface PredictiveAiRequest {
  category: PredictionCategory;
  userQuery?: string;
  timeHorizonMonths?: number;
}

// ── Response model ───────────────────────────────────────────────────────────
// 🎓 Maps to PredictiveAiAPIModel_Response on the backend.
// Contains the AI-generated prediction plus metadata about the run.
//
// 🎓 KEY DIFFERENCE FROM CrossEntityAnalyticsResponse:
// - Field name is `prediction` (not `analysis`) — semantic clarity
// - Includes `timeHorizonMonths` — echoes back the effective forecast window
// - Same token/cost metadata fields (provider, model, tokens, estimatedCost)

export interface PredictiveAiResponse {
  /** The AI-generated prediction text (markdown-formatted) */
  prediction: string;

  /** Which category was predicted (echoed back, uppercased) */
  category: string;

  /** How many entities (styles/buyers/suppliers/orders) were included */
  entityCount: number;

  /** The effective time horizon used for this prediction (1-12 months) */
  timeHorizonMonths: number;

  /** Which AI provider answered (e.g. "Anthropic", "OpenAI") */
  provider: string;

  /** Which model was used (e.g. "claude-sonnet-4-20250514") */
  model: string;

  /** Tokens consumed by the prompt (system + user message) */
  inputTokens: number;

  /** Tokens generated in the response */
  outputTokens: number;

  /** Total tokens (input + output) */
  totalTokens: number;

  /** Estimated cost in USD for this request */
  estimatedCost: number;

  /** When the prediction was generated (ISO 8601 datetime) */
  generatedAt: string;
}

// ── Category info (for the category selector) ───────────────────────────────
// 🎓 Maps to PredictionCategoryInfo on the backend.
// GET /api/ai/predictions/categories returns an array of these.
//
// 🎓 INCLUDES iconHint — a string suggesting which MUI icon to render.
// The backend sends icon hints (e.g. "TrendingUp", "WarningAmber", "Shield",
// "Savings") so the frontend can pick the matching MUI icon component.
// This is a loose coupling pattern — the backend doesn't import React icons,
// it just suggests one by name.

export interface PredictionCategoryInfo {
  /** The category key to send in the request (e.g. "DEMAND_FORECASTING") */
  key: PredictionCategory;

  /** Human-readable display name (e.g. "Demand Forecasting") */
  name: string;

  /** Short description of what this category predicts */
  description: string;

  /** MUI icon name hint for the frontend (e.g. "TrendingUp", "Shield") */
  iconHint: string;
}
