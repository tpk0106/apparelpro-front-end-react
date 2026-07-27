import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getReturnableStockByBuyerOrder,
  commitSRN,
} from "../services/supplier-return-note.service";
import type {
  SrnReturnableStockRow,
  SrnSubmissionPayload,
  SrnMutationResponse,
} from "../components/orderwise-inventory/supplier-return-note.types";

// Cascade lookup: fires once Buyer+Order are both selected. Note this does NOT depend
// on the Supplier selection — GetReturnableStockByBuyerOrderAsync only validates
// Buyer/Order; Supplier is only required at commit time (see SRNController).
export const useGetReturnableStockByBuyerOrderQuery = (
  params: { buyerCode: number; order: string },
  enabled: boolean,
) => {
  return useQuery<SrnReturnableStockRow[], AppError>({
    queryKey: ["srnReturnableStock", params.buyerCode, params.order],
    queryFn: async () => {
      const response: AxiosResponse<SrnReturnableStockRow[]> =
        await getReturnableStockByBuyerOrder(params);
      return response.data;
    },
    enabled,
  });
};

export const useCommitSrnMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<SrnMutationResponse, AppError, SrnSubmissionPayload>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<SrnMutationResponse> = await commitSRN(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["srnReturnableStock"] });
    },
  });
};
