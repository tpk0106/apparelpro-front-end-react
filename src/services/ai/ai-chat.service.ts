import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

// ─── Request types ────────────────────────────────────────

export interface AiChatSendMessageRequest {
  sessionId?: string;
  entityType?: string;
  entityKey?: string;
  message: string;
}

// ─── Response types ───────────────────────────────────────

export interface AiChatMessageResponse {
  sessionId: string;
  messageId: string;
  sessionTitle: string;
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
  messageCount: number;
  createdAt: string;
  lastMessageAt: string;
  messages: AiChatMessageItem[];
}

export interface AiChatMessageItem {
  messageId: string;
  role: "user" | "assistant";
  content: string;
  tokensUsed: number;
  createdAt: string;
}

export interface PaginatedChatSessions {
  items: AiChatSessionSummary[];
  pageSize: number;
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// ─── Service functions ────────────────────────────────────

const sendChatMessage = async (request: AiChatSendMessageRequest) => {
  return await client.post<AiChatMessageResponse>(
    APPARELPRO_ENDPOINTS.AI.CHAT_SEND,
    request,
    { timeout: 120000 },
  );
};

const getChatSessions = async (
  entityType: string,
  entityKey: string,
  pageNumber: number = 1,
  pageSize: number = 20,
) => {
  return await client.get<PaginatedChatSessions>(
    APPARELPRO_ENDPOINTS.AI.CHAT_SESSIONS,
    {
      params: { entityType, entityKey, pageNumber, pageSize },
    },
  );
};

const getChatSessionDetail = async (sessionId: string) => {
  return await client.get<AiChatSessionDetail>(
    `${APPARELPRO_ENDPOINTS.AI.CHAT_SESSIONS}/${sessionId}`,
  );
};

const deleteChatSession = async (sessionId: string) => {
  return await client.delete(
    `${APPARELPRO_ENDPOINTS.AI.CHAT_SESSIONS}/${sessionId}`,
  );
};

export {
  sendChatMessage,
  getChatSessions,
  getChatSessionDetail,
  deleteChatSession,
};
