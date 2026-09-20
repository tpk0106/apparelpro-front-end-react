import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  summariseEntity,
  analyseEntity,
  type AiSummariseRequest,
  type AiSummariseResponse,
  type AiAnalyseRequest,
  type AiAnalyseResponse,
} from "../../services/ai/ai.service";

// ─── Summarise ─────────────────────────────────────────────

export const useAiSummarise = (): UseMutationResult<
  AiSummariseResponse,
  AppError,
  AiSummariseRequest
> => {
  return useMutation<AiSummariseResponse, AppError, AiSummariseRequest>({
    mutationFn: async (request) => {
      const response: AxiosResponse<AiSummariseResponse> =
        await summariseEntity(request);
      return response.data;
    },
  });
};

// ─── Analyse (Phase 1) ────────────────────────────────────

export const useAiAnalyse = (): UseMutationResult<
  AiAnalyseResponse,
  AppError,
  AiAnalyseRequest
> => {
  return useMutation<AiAnalyseResponse, AppError, AiAnalyseRequest>({
    mutationFn: async (request) => {
      const response: AxiosResponse<AiAnalyseResponse> =
        await analyseEntity(request);
      return response.data;
    },
  });
};
