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

// ─── Service functions ─────────────────────────────────────

const summariseEntity = async (request: AiSummariseRequest) => {
  return await client.post<AiSummariseResponse>(
    APPARELPRO_ENDPOINTS.AI.SUMMARISE,
    request,
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

export {
  summariseEntity,
  analyseEntity,
  sendChatMessage,
  getChatSessions,
  getChatSession,
  deleteChatSession,
};
