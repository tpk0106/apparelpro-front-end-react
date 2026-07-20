import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getReceivableLinesByPo,
  commitGRN,
  getPendingPosByOrder,
} from "../services/goods-received-note.service";
import type {
  GrnPoLookupResult,
  GrnSubmissionPayload,
  GrnMutationResponse,
  GrnPendingPo,
} from "../components/orderwise-inventory/goods-received-note.types";

// Direct-entry lookup: fires once the user has typed a known PO number
export const useGetReceivableLinesByPoQuery = (poNumber: string, enabled: boolean) => {
  return useQuery<GrnPoLookupResult, AppError>({
    queryKey: ["grnReceivableLines", poNumber],
    queryFn: async () => {
      const response: AxiosResponse<GrnPoLookupResult> = await getReceivableLinesByPo(poNumber);
      return response.data;
    },
    enabled,
  });
};

// Cascade lookup: fires once Buyer+Order are both selected
export const useGetPendingPosByOrderQuery = (
  params: { buyerCode: number; order: string },
  enabled: boolean,
) => {
  return useQuery<GrnPendingPo[], AppError>({
    queryKey: ["grnPendingPos", params.buyerCode, params.order],
    queryFn: async () => {
      const response: AxiosResponse<GrnPendingPo[]> = await getPendingPosByOrder(params);
      return response.data;
    },
    enabled,
  });
};

export const useCommitGrnMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<GrnMutationResponse, AppError, GrnSubmissionPayload>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<GrnMutationResponse> = await commitGRN(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grnReceivableLines"] });
      queryClient.invalidateQueries({ queryKey: ["grnPendingPos"] });
    },
  });
};
