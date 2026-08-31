import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getReceivableStockByBuyerOrder,
  commitARN,
} from "../services/orderwise-inventory/additional-goods-receipt-note.service";
import type {
  ArnReceivableStockRow,
  ArnSubmissionPayload,
  ArnMutationResponse,
} from "../components/orderwise-inventory/additional-goods-receipt-note.types";

// Cascade lookup, called per-row (unlike AIN's single top-level call) since every
// ARN line can target a different Buyer/Order.
export const useGetReceivableStockByBuyerOrderQuery = (
  params: { buyerCode: number; order: string },
  enabled: boolean,
) => {
  return useQuery<ArnReceivableStockRow[], AppError>({
    queryKey: ["arnReceivableStock", params.buyerCode, params.order],
    queryFn: async () => {
      const response: AxiosResponse<ArnReceivableStockRow[]> =
        await getReceivableStockByBuyerOrder(params);
      return response.data;
    },
    enabled,
  });
};

export const useCommitArnMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ArnMutationResponse, AppError, ArnSubmissionPayload>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<ArnMutationResponse> =
        await commitARN(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arnReceivableStock"] });
    },
  });
};
