import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

// ─── Summarise / Analyse types (unchanged) ────────────────

export interface AiSummariseRequest {
  entityType: string;
  entityKey: string;
  userQuery?: string;
}

export interface AiSummariseResponse {
  summary: string;
  entityType: string;
  entityKey: string;
  provider: string;
  generatedAt: string;
}

export interface AiAnalyseRequest {
  entityType: string;
  entityKey: string;
  userQuery?: string;
}

export interface AiAnalyseResponse {
  analysis: string;
  entityType: string;
  entityKey: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  generatedAt: string;
}

// ─── Chat types (matching AiChatAPIModels.cs) ─────────────

export interface AiChatSendMessageRequest {
  sessionId?: string;
  entityType?: string;
  entityKey?: string;
  message: string;
  /** When set, forces the backend to use this AI provider (e.g. "OpenAI" for voice mode). */
  preferredProvider?: string;
}

export interface AiChatMessageResponse {
  sessionId: string;
  sessionTitle: string;
  messageId: string;
  reply: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  createdAt: string;
  isNewSession: boolean;
}

export interface AiChatSessionSummary {
  sessionId: string;
  entityType: string;
  entityKey: string;
  title: string | null;
  messageCount: number;
  createdAt: string;
  lastMessageAt: string;
}

export interface AiChatSessionDetail {
  sessionId: string;
  entityType: string;
  entityKey: string;
  title: string | null;
  createdAt: string;
  lastMessageAt: string;
  messages: AiChatMessageItem[];
}

export interface AiChatMessageItem {
  messageId: string;
  role: string;
  content: string;
  tokensUsed: number;
  createdAt: string;
}

export interface AiChatSessionsPage {
  items: AiChatSessionSummary[];
  pageSize: number;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  sortColumn: string | null;
  sortOrder: string | null;
  filterColumn: string | null;
  filterQuery: string | null;
}

// ─── RAG types (matching RagModels.cs) ───────────────────────
//
// 🎓 RAG = Retrieval-Augmented Generation.
// Instead of asking Claude to "just know" about our ERP data,
// we first SEARCH our vector database (Qdrant) for relevant chunks,
// then pass those chunks as context to Claude so it can generate
// a grounded, verifiable answer with source references.

/**
 * 🎓 What the frontend sends to POST /api/rag/query.
 *
 * - `question` — the user's natural-language question
 * - `entityTypeFilter` — optional: restricts the vector search to one
 *    entity type (e.g. "Style", "PurchaseOrder", "Buyer", "Supplier").
 *    When null/undefined the search spans ALL entity types.
 */
export interface RagQueryRequest {
  question: string;
  entityTypeFilter?: string | null;
}

/**
 * 🎓 A single "citation" returned alongside the RAG answer.
 *
 * Each source tells the user:
 *   • which ERP record contributed to the answer (entityType + entityKey)
 *   • how relevant it was (score — cosine similarity 0–1)
 *   • a short text preview so they can recognise the record at a glance
 *
 * The UI renders these as clickable "evidence cards" beneath the answer.
 */
export interface RagSourceReference {
  entityType: string;
  entityKey: string;
  /** Cosine similarity score (0.0 – 1.0). Higher = more relevant. */
  score: number;
  /** First ~150 chars of the chunk text — enough to recognise the record. */
  chunkPreview: string;
}

/**
 * 🎓 Detected report intent from Claude's RAG response.
 *
 * When the user asks something like "Can I get the Trim Sheet for ANCHORAGE?",
 * Claude detects this as a REPORT REQUEST (not a data question) and returns
 * structured intent data. The frontend uses this to trigger PDF generation
 * automatically instead of just showing a text answer.
 *
 * 🎓 CONFIDENCE-BASED UI BEHAVIOR:
 *   confidence >= 0.8  → Auto-generate the PDF (high confidence)
 *   confidence 0.5–0.8 → Show a "Generate this report?" confirmation dialog
 *   confidence < 0.5   → Just show the text answer (shouldn't happen — filtered server-side)
 *
 * 🎓 SECURITY NOTE:
 * The endpointTemplate comes from the SERVER's ReportRegistry table, NOT from Claude's output.
 * This prevents prompt injection attacks where a malicious question could trick Claude
 * into returning a dangerous endpoint. The server looks up the real endpoint by reportCode.
 */
export interface ReportIntentDetection {
  /** The report code from the ReportRegistry table (e.g., "TrimSheet") */
  reportCode: string;
  /** Human-readable display name (e.g., "Trim Sheet Report") */
  displayName: string;
  /** API endpoint template from the registry (e.g., "api/trim-sheet-report/pdf") */
  endpointTemplate: string;
  /**
   * 🎓 Extracted parameter values, ready to pass as query params to the report endpoint.
   * Keys vary by report type — TrimSheet needs buyerCode, order, typeCode, styleCode;
   * another report might need different params. All values are strings because
   * HTTP query parameters are strings — the backend handles type conversion.
   */
  parameters: Record<string, string>;
  /**
   * 🎓 Claude's confidence that this is truly a report request (0.0 – 1.0).
   * Used by the UI to decide: auto-trigger PDF vs. show confirmation vs. ignore.
   */
  confidence: number;
}

/**
 * 🎓 Full response from the RAG pipeline.
 *
 * Key fields for the UI:
 *   • `hasResults` — false means no vector matches; show a "rephrase" hint
 *   • `answer` — Claude's generated text grounded in the retrieved chunks
 *   • `sources` — the evidence cards (ordered by relevance, highest first)
 *   • `detectedReportIntent` — when Claude detects a report request, this contains
 *      the report code, display name, endpoint, and extracted parameters.
 *      Null/undefined means it's a regular data question, not a report request.
 *   • token counts — useful for a subtle cost/usage indicator
 */
export interface RagQueryResponse {
  answer: string;
  hasResults: boolean;
  sources: RagSourceReference[];
  retrievedChunkCount: number;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  /**
   * 🎓 When Claude detects the user wants a REPORT (not just a data question),
   * this contains the intent details. The UI checks this field:
   *   - If null/undefined → normal RAG answer, show text + source cards
   *   - If present → report request, trigger PDF generation flow
   */
  detectedReportIntent?: ReportIntentDetection | null;
}

// ─── Service functions ─────────────────────────────────────

const summariseEntity = async (request: AiSummariseRequest) => {
  return await client.post<AiSummariseResponse>(
    APPARELPRO_ENDPOINTS.AI.SUMMARISE,
    request,
    { timeout: 120000 }, // 2 minutes — enriched summaries need more time
  );
};

const analyseEntity = async (request: AiAnalyseRequest) => {
  return await client.post<AiAnalyseResponse>(
    APPARELPRO_ENDPOINTS.AI.ANALYSE,
    request,
    { timeout: 120000 }, // 2 minutes — analysis needs more time
  );
};

const sendChatMessage = async (request: AiChatSendMessageRequest) => {
  return await client.post<AiChatMessageResponse>(
    APPARELPRO_ENDPOINTS.AI.CHAT.SEND,
    request,
    { timeout: 120000 },
  );
};

const getChatSessions = async (
  pageNumber: number = 1,
  pageSize: number = 20,
) => {
  return await client.get<AiChatSessionsPage>(
    APPARELPRO_ENDPOINTS.AI.CHAT.SESSIONS,
    { params: { pageNumber, pageSize } },
  );
};

const getChatSession = async (sessionId: string) => {
  return await client.get<AiChatSessionDetail>(
    APPARELPRO_ENDPOINTS.AI.CHAT.SESSION_BY_ID(sessionId),
  );
};

const deleteChatSession = async (sessionId: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.AI.CHAT.DELETE_SESSION(sessionId),
  );
};

/**
 * 🎓 Send a RAG query to the backend pipeline.
 *
 * Flow:  Question → OpenAI embedding → Qdrant vector search
 *        → matched chunks as context → Claude generates answer
 *
 * Timeout is 120 seconds because the pipeline does THREE async operations:
 *   1. Embed the question (~200ms)
 *   2. Search Qdrant (~100ms)
 *   3. Claude generation (~5-15s depending on context size)
 */
const queryRag = async (request: RagQueryRequest) => {
  return await client.post<RagQueryResponse>(
    APPARELPRO_ENDPOINTS.AI.RAG.QUERY,
    request,
    { timeout: 120000 },
  );
};

/**
 * 🎓 Fetch a report PDF from the backend using authenticated request.
 *
 * WHY NOT window.open()?
 * Our API endpoints are protected by JWT Bearer token authentication.
 * window.open() opens a plain browser tab — it does NOT send the Authorization
 * header, so the server responds with HTTP 401 Unauthorized.
 *
 * INSTEAD, we use the authenticated axios client (which has the JWT interceptor)
 * to fetch the PDF as a binary blob, then create a temporary browser object URL
 * and open THAT in a new tab. The flow:
 *
 *   1. axios GET → server validates JWT → returns PDF binary
 *   2. Create a Blob from the response (type: application/pdf)
 *   3. URL.createObjectURL(blob) → "blob:https://..." temporary URL
 *   4. window.open(blobUrl) → browser's native PDF viewer opens
 *   5. After a short delay, revoke the blob URL to free memory
 *
 * @param endpointTemplate - The report endpoint path (e.g., "api/trim-sheet-report/pdf")
 * @param parameters - Query parameters extracted by Claude (e.g., { buyerCode: "1", styleCode: "ANCHORAGE" })
 * @returns The blob URL string (useful for re-opening) or null if the request failed
 */
const fetchReportPdf = async (
  endpointTemplate: string,
  parameters: Record<string, string>,
): Promise<string | null> => {
  try {
    // 🎓 Build query string from the extracted parameters
    const queryString = new URLSearchParams(parameters).toString();
    const url = `${endpointTemplate}?${queryString}`;

    // 🎓 Fetch the PDF as a binary blob using the authenticated client.
    // responseType: "blob" tells axios to treat the response as raw binary data
    // instead of trying to parse it as JSON.
    const response = await client.get(url, {
      responseType: "blob",
      timeout: 60000, // 60 seconds — PDF generation can take time
    });

    // 🎓 Create a temporary browser URL from the blob.
    // This URL is only valid in THIS browser tab/window and is automatically
    // garbage-collected when the page unloads — but we also revoke it manually
    // after a short delay to be safe with memory.
    const blob = new Blob([response.data], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    // 🎓 Open the blob URL in a new tab — browser's PDF viewer renders it
    window.open(blobUrl, "_blank");

    // 🎓 Revoke the blob URL after 60 seconds to free memory.
    // The PDF viewer will have loaded the data by then, so revoking is safe.
    // We use setTimeout to avoid revoking while the tab is still loading.
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);

    return blobUrl;
  } catch {
    // 🎓 Let the caller handle the error (show toast, update UI, etc.)
    return null;
  }
};

export {
  summariseEntity,
  analyseEntity,
  sendChatMessage,
  getChatSessions,
  getChatSession,
  deleteChatSession,
  queryRag,
  fetchReportPdf,
};

// 🎓 Re-export types that other components need.
// ReportIntentDetection is used by RagSearchPanel to check for report intent
// and trigger PDF generation. We export it from this barrel so the import
// stays in one place: import { ..., ReportIntentDetection } from "../../services/ai/ai.service";
