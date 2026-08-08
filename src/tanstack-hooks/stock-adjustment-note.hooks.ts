import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getAdjustableStockByBuyerOrder,
  commitSAN,
} from "../services/orderwise-inventory/stock-adjustment-note.service";
import type {
  SanAdjustableStockRow,
  SanSubmissionPayload,
  SanMutationResponse,
} from "../components/orderwise-inventory/stock-adjustment-note.types";

// Cascade lookup: fires once Buyer+Order are both selected.
export const useGetAdjustableStockByBuyerOrderQuery = (
  params: { buyerCode: number; order: string },
  enabled: boolean,
) => {
  return useQuery<SanAdjustableStockRow[], AppError>({
    queryKey: ["sanAdjustableStock", params.buyerCode, params.order],
    queryFn: async () => {
      const response: AxiosResponse<SanAdjustableStockRow[]> =
        await getAdjustableStockByBuyerOrder(params);
      return response.data;
    },
    enabled,
  });
};

export const useCommitSanMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<SanMutationResponse, AppError, SanSubmissionPayload>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<SanMutationResponse> =
        await commitSAN(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sanAdjustableStock"] });
    },
  });
};
