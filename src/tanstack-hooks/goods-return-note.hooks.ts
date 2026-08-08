import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getReturnableStockByBuyerOrder,
  commitRTN,
} from "../services/orderwise-inventory/goods-return-note.service";
import type {
  RtnReturnableStockRow,
  RtnSubmissionPayload,
  RtnMutationResponse,
} from "../components/orderwise-inventory/goods-return-note.types";

// Cascade lookup: fires once Buyer+Order are both selected
export const useGetReturnableStockByBuyerOrderQuery = (
  params: { buyerCode: number; order: string },
  enabled: boolean,
) => {
  return useQuery<RtnReturnableStockRow[], AppError>({
    queryKey: ["rtnReturnableStock", params.buyerCode, params.order],
    queryFn: async () => {
      const response: AxiosResponse<RtnReturnableStockRow[]> =
        await getReturnableStockByBuyerOrder(params);
      return response.data;
    },
    enabled,
  });
};

export const useCommitRtnMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<RtnMutationResponse, AppError, RtnSubmissionPayload>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<RtnMutationResponse> =
        await commitRTN(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rtnReturnableStock"] });
    },
  });
};
