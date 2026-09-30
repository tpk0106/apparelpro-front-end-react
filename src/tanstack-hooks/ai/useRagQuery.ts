/**
 * 🎓 TanStack Query hook for RAG (Retrieval-Augmented Generation) queries.
 *
 * This follows the same pattern as useAiChat.ts:
 *   • useMutation for the query (not useQuery, because each search is a
 *     user-initiated action, not a cached resource we'd want to refetch)
 *   • Typed request/response via the interfaces in ai.service.ts
 *   • AppError for consistent error handling across the app
 *
 * Why a mutation instead of a query?
 *   A RAG question is a COMMAND ("go search and generate"), not a READ
 *   ("give me the cached result for key X"). Each question might return
 *   different results even with the same text (if data has been re-indexed),
 *   so caching doesn't add value here.
 */
import {
  useMutation,
  type UseMutationResult,
} from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  queryRag,
  type RagQueryRequest,
  type RagQueryResponse,
} from "../../services/ai/ai.service";

// ─── Query keys (for future use if we add RAG history) ──────

export const ragKeys = {
  all: ["rag"] as const,
} as const;

// ─── Send RAG query (mutation) ──────────────────────────────

/**
 * 🎓 Hook to send a RAG question and receive a grounded answer.
 *
 * Usage in a component:
 *
 *   const ragMutation = useRagQuery();
 *
 *   const handleAsk = () => {
 *     ragMutation.mutate({
 *       question: "Which buyers have overdue orders?",
 *       entityTypeFilter: "PurchaseOrder",     // optional
 *     });
 *   };
 *
 *   // ragMutation.data?.answer       — Claude's generated answer
 *   // ragMutation.data?.sources      — the evidence cards
 *   // ragMutation.data?.hasResults   — false = no vector matches
 *   // ragMutation.isPending          — show typing indicator
 *   // ragMutation.isError            — show error state
 */
export const useRagQuery = (): UseMutationResult<
  RagQueryResponse,
  AppError,
  RagQueryRequest
> => {
  return useMutation<
    RagQueryResponse,
    AppError,
    RagQueryRequest
  >({
    /**
     * 🎓 mutationFn unwraps the Axios response so the component
     * gets the clean RagQueryResponse object directly, not
     * AxiosResponse<RagQueryResponse>.
     */
    mutationFn: async (request) => {
      const response: AxiosResponse<RagQueryResponse> =
        await queryRag(request);
      return response.data;
    },
  });
};
