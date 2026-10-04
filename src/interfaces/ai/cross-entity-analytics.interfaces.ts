// ─────────────────────────────────────────────────────────────────────────────
// 🎓 CROSS-ENTITY ANALYTICS INTERFACES
// TypeScript type definitions for Phase 2, Feature 1: Cross-Entity Analytics.
//
// These mirror the C# API models in ApparelPro.AI.Models:
//   - CrossEntityAnalyticsAPIModel        → CrossEntityAnalyticsRequest (POST body)
//   - CrossEntityAnalyticsAPIModel_Response → CrossEntityAnalyticsResponse
//   - AnalyticsCategoryInfo               → AnalyticsCategoryInfo (GET /categories)
//
// 🎓 WHY A SEPARATE INTERFACES FILE?
// Same pattern as anomaly-alert.interfaces.ts — each AI feature gets its own
// type definitions file. This keeps imports clean and makes it obvious which
// types belong to which feature when browsing the interfaces/ai/ folder.
// ─────────────────────────────────────────────────────────────────────────────

// ── Analytics category union type ────────────────────────────────────────────
// 🎓 Matches the 5 categories defined in AnalyticsPromptTemplates.cs on the
// backend. Using a string literal union gives us compile-time safety — if we
// typo a category name, TypeScript catches it before runtime.

export type AnalyticsCategory =
  | "MATERIAL_CONSUMPTION"
  | "SUPPLIER_PERFORMANCE"
  | "BUYER_PORTFOLIO"
  | "ORDER_PIPELINE"
  | "COST_ANALYSIS";

// ── Request model ────────────────────────────────────────────────────────────
// 🎓 Maps to CrossEntityAnalyticsAPIModel on the backend.
// POST /api/ai/analytics expects this shape.
//
// category:  Required — which analytics dimension to analyse.
// userQuery: Optional — a follow-up question that gets appended to the AI
//            prompt. For example: "Which styles have wastage above 8%?"
//            When null/undefined, the AI uses the default category prompt.

export interface CrossEntityAnalyticsRequest {
  category: AnalyticsCategory;
  userQuery?: string;
}

// ── Response model ───────────────────────────────────────────────────────────
// 🎓 Maps to CrossEntityAnalyticsAPIModel_Response on the backend.
// Contains the AI-generated analysis plus metadata about the run.
//
// 🎓 WHY SO MANY TOKEN FIELDS?
// Token counts let us show usage transparency to the user — how many tokens
// the query consumed and what it cost. This is the same pattern used by
// AiController's summarise/analyse endpoints. The merchandiser or their
// manager can see AI costs per analytics run.

export interface CrossEntityAnalyticsResponse {
  /** The AI-generated analysis text (markdown-formatted) */
  analysis: string;

  /** Which category was analysed (echoed back, uppercased) */
  category: string;

  /** How many entities (styles/buyers/suppliers/orders) were included */
  entityCount: number;

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

  /** When the analysis was generated (ISO 8601 datetime) */
  generatedAt: string;
}

// ── Category info (for the category selector dropdown) ───────────────────────
// 🎓 Maps to AnalyticsCategoryInfo on the backend.
// GET /api/ai/analytics/categories returns an array of these.
//
// The frontend uses this to populate the category selector dropdown so the
// available categories are driven by the backend — if we add a new category
// on the backend, the frontend automatically picks it up.

export interface AnalyticsCategoryInfo {
  /** The category key to send in the request (e.g. "MATERIAL_CONSUMPTION") */
  key: AnalyticsCategory;

  /** Human-readable display name (e.g. "Material Consumption") */
  name: string;

  /** Short description of what this category analyses */
  description: string;
}
