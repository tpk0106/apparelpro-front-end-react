import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getDamageableStockByBuyerOrder,
  commitDGN,
} from "../services/orderwise-inventory/damaged-goods-note.service";
import type {
  DgnDamageableStockRow,
  DgnSubmissionPayload,
  DgnMutationResponse,
} from "../components/orderwise-inventory/damaged-goods-note.types";

// Cascade lookup: fires once Buyer+Order are both selected.
export const useGetDamageableStockByBuyerOrderQuery = (
  params: { buyerCode: number; order: string },
  enabled: boolean,
) => {
  return useQuery<DgnDamageableStockRow[], AppError>({
    queryKey: ["dgnDamageableStock", params.buyerCode, params.order],
    queryFn: async () => {
      const response: AxiosResponse<DgnDamageableStockRow[]> =
        await getDamageableStockByBuyerOrder(params);
      return response.data;
    },
    enabled,
  });
};

export const useCommitDgnMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<DgnMutationResponse, AppError, DgnSubmissionPayload>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<DgnMutationResponse> =
        await commitDGN(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dgnDamageableStock"] });
    },
  });
};
