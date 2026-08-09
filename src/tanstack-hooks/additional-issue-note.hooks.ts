import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getIssuableStockByBuyerOrder,
  commitAIN,
} from "../services/orderwise-inventory/additional-issue-note.service";
import type {
  AinIssuableStockRow,
  AinSubmissionPayload,
  AinMutationResponse,
} from "../components/orderwise-inventory/additional-issue-note.types";

// Cascade lookup: fires once Buyer+Order are both selected (mirrors
// useGetAdjustableStockByBuyerOrderQuery in stock-adjustment-note.hooks.ts).
export const useGetIssuableStockByBuyerOrderQuery = (
  params: { buyerCode: number; order: string },
  enabled: boolean,
) => {
  return useQuery<AinIssuableStockRow[], AppError>({
    queryKey: ["ainIssuableStock", params.buyerCode, params.order],
    queryFn: async () => {
      const response: AxiosResponse<AinIssuableStockRow[]> =
        await getIssuableStockByBuyerOrder(params);
      return response.data;
    },
    enabled,
  });
};

export const useCommitAinMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<AinMutationResponse, AppError, AinSubmissionPayload>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<AinMutationResponse> =
        await commitAIN(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ainIssuableStock"] });
    },
  });
};
