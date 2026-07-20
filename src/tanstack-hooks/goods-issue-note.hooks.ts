import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getIssuableStrnLines,
  commitGIN,
  getPendingStrnsByOrder,
} from "../services/goods-issue-note.service";
import type {
  GinStrnLookupResult,
  GinSubmissionPayload,
  GinMutationResponse,
  GinPendingStrn,
} from "../components/orderwise-inventory/goods-issue-note.types";

// Direct-entry lookup: fires once the user has typed a known STRN number
export const useGetIssuableStrnLinesQuery = (strnNumber: string, enabled: boolean) => {
  return useQuery<GinStrnLookupResult, AppError>({
    queryKey: ["ginIssuableLines", strnNumber],
    queryFn: async () => {
      const response: AxiosResponse<GinStrnLookupResult> = await getIssuableStrnLines(strnNumber);
      return response.data;
    },
    enabled,
  });
};

// Cascade lookup: fires once Buyer+Order are both selected
export const useGetPendingStrnsByOrderQuery = (
  params: { buyerCode: number; order: string },
  enabled: boolean,
) => {
  return useQuery<GinPendingStrn[], AppError>({
    queryKey: ["ginPendingStrns", params.buyerCode, params.order],
    queryFn: async () => {
      const response: AxiosResponse<GinPendingStrn[]> = await getPendingStrnsByOrder(params);
      return response.data;
    },
    enabled,
  });
};

export const useCommitGinMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<GinMutationResponse, AppError, GinSubmissionPayload>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<GinMutationResponse> = await commitGIN(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ginIssuableLines"] });
      queryClient.invalidateQueries({ queryKey: ["ginPendingStrns"] });
    },
  });
};
