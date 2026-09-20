import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  sendChatMessage,
  getChatSessions,
  getChatSessionDetail,
  deleteChatSession,
  type AiChatSendMessageRequest,
  type AiChatMessageResponse,
  type PaginatedChatSessions,
  type AiChatSessionDetail,
} from "../../services/ai/ai-chat.service";

// ─── Query keys ───────────────────────────────────────────

export const aiChatKeys = {
  all: ["ai-chat"] as const,
  sessions: (entityType: string, entityKey: string) =>
    [...aiChatKeys.all, "sessions", entityType, entityKey] as const,
  sessionDetail: (sessionId: string) =>
    [...aiChatKeys.all, "session", sessionId] as const,
};

// ─── Send message (mutation) ──────────────────────────────

export const useAiChatSend = (): UseMutationResult<
  AiChatMessageResponse,
  AppError,
  AiChatSendMessageRequest
> => {
  const queryClient = useQueryClient();

  return useMutation<AiChatMessageResponse, AppError, AiChatSendMessageRequest>(
    {
      mutationFn: async (request) => {
        const response: AxiosResponse<AiChatMessageResponse> =
          await sendChatMessage(request);
        return response.data;
      },
      onSuccess: (data) => {
        // Invalidate sessions list so new/updated session appears
        queryClient.invalidateQueries({
          queryKey: aiChatKeys.all,
        });
        // If we have session detail loaded, invalidate it too
        if (data.sessionId) {
          queryClient.invalidateQueries({
            queryKey: aiChatKeys.sessionDetail(data.sessionId),
          });
        }
      },
    },
  );
};

// ─── List sessions (query) ───────────────────────────────

export const useAiChatSessions = (
  entityType: string,
  entityKey: string,
  pageNumber: number = 1,
  pageSize: number = 20,
  enabled: boolean = true,
): UseQueryResult<PaginatedChatSessions, AppError> => {
  return useQuery<PaginatedChatSessions, AppError>({
    queryKey: [...aiChatKeys.sessions(entityType, entityKey), pageNumber, pageSize],
    queryFn: async () => {
      const response: AxiosResponse<PaginatedChatSessions> =
        await getChatSessions(entityType, entityKey, pageNumber, pageSize);
      return response.data;
    },
    enabled,
  });
};

// ─── Session detail (query) ──────────────────────────────

export const useAiChatSessionDetail = (
  sessionId: string | null,
): UseQueryResult<AiChatSessionDetail, AppError> => {
  return useQuery<AiChatSessionDetail, AppError>({
    queryKey: aiChatKeys.sessionDetail(sessionId ?? ""),
    queryFn: async () => {
      const response: AxiosResponse<AiChatSessionDetail> =
        await getChatSessionDetail(sessionId!);
      return response.data;
    },
    enabled: !!sessionId,
  });
};

// ─── Delete session (mutation) ───────────────────────────

export const useAiChatDeleteSession = (): UseMutationResult<
  void,
  AppError,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation<void, AppError, string>({
    mutationFn: async (sessionId) => {
      await deleteChatSession(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: aiChatKeys.all,
      });
    },
  });
};
