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
 * 🎓 Full response from the RAG pipeline.
 *
 * Key fields for the UI:
 *   • `hasResults` — false means no vector matches; show a "rephrase" hint
 *   • `answer` — Claude's generated text grounded in the retrieved chunks
 *   • `sources` — the evidence cards (ordered by relevance, highest first)
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

export {
  summariseEntity,
  analyseEntity,
  sendChatMessage,
  getChatSessions,
  getChatSession,
  deleteChatSession,
  queryRag,
};
