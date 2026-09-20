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
  getChatSession,
  deleteChatSession,
  type AiChatSendMessageRequest,
  type AiChatMessageResponse,
  type AiChatSessionsPage,
  type AiChatSessionDetail,
} from "../../services/ai/ai.service";

// ─── Query keys ───────────────────────────────────────────

export const aiChatKeys = {
  all: ["ai-chat"] as const,
  sessions: (page: number, size: number) =>
    [...aiChatKeys.all, "sessions", page, size] as const,
  session: (sessionId: string) =>
    [...aiChatKeys.all, "session", sessionId] as const,
};

// ─── Send message (mutation) ──────────────────────────────

export const useAiChatSend = (): UseMutationResult<
  AiChatMessageResponse,
  AppError,
  AiChatSendMessageRequest
> => {
  const queryClient = useQueryClient();

  return useMutation<
    AiChatMessageResponse,
    AppError,
    AiChatSendMessageRequest
  >({
    mutationFn: async (request) => {
      const response: AxiosResponse<AiChatMessageResponse> =
        await sendChatMessage(request);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate sessions list so it picks up new/updated sessions
      queryClient.invalidateQueries({ queryKey: aiChatKeys.all });
      // If continuing an existing session, invalidate that session's detail
      if (!data.isNewSession) {
        queryClient.invalidateQueries({
          queryKey: aiChatKeys.session(data.sessionId),
        });
      }
    },
  });
};

// ─── Get sessions list (query) ────────────────────────────

export const useAiChatSessions = (
  pageNumber: number = 1,
  pageSize: number = 20,
  enabled: boolean = true,
): UseQueryResult<AiChatSessionsPage, AppError> => {
  return useQuery<AiChatSessionsPage, AppError>({
    queryKey: aiChatKeys.sessions(pageNumber, pageSize),
    queryFn: async () => {
      const response: AxiosResponse<AiChatSessionsPage> =
        await getChatSessions(pageNumber, pageSize);
      return response.data;
    },
    enabled,
    staleTime: 30_000,
  });
};

// ─── Get single session detail (query) ────────────────────

export const useAiChatSession = (
  sessionId: string | null,
): UseQueryResult<AiChatSessionDetail, AppError> => {
  return useQuery<AiChatSessionDetail, AppError>({
    queryKey: aiChatKeys.session(sessionId ?? ""),
    queryFn: async () => {
      const response: AxiosResponse<AiChatSessionDetail> =
        await getChatSession(sessionId!);
      return response.data;
    },
    enabled: !!sessionId,
    staleTime: 10_000,
  });
};

// ─── Delete session (mutation) ────────────────────────────

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
      queryClient.invalidateQueries({ queryKey: aiChatKeys.all });
    },
  });
};
