import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getFromStock,
  getToOrderItems,
  commitDTN,
} from "../services/orderwise-inventory/direct-transfer-note.service";
import type {
  DtnFromStockRow,
  DtnToItem,
  DtnSubmissionPayload,
  DtnMutationResponse,
} from "../components/orderwise-inventory/direct-transfer-note.types";

// Cascade lookup: fires once From Buyer+Order AND To Buyer+Order are all selected.
// queryKey spells out every real parameter value, same convention already established
// for GTN's own transferable-stock lookup.
export const useGetFromStockQuery = (
  params: {
    fromBuyerCode: number;
    fromOrder: string;
    toBuyerCode: number;
    toOrder: string;
  },
  enabled: boolean,
) => {
  return useQuery<DtnFromStockRow[], AppError>({
    queryKey: [
      "dtnFromStock",
      params.fromBuyerCode,
      params.fromOrder,
      params.toBuyerCode,
      params.toOrder,
    ],
    queryFn: async () => {
      const response: AxiosResponse<DtnFromStockRow[]> =
        await getFromStock(params);
      return response.data;
    },
    enabled,
  });
};

export const useGetToOrderItemsQuery = (
  params: { toBuyerCode: number; toOrder: string },
  enabled: boolean,
) => {
  return useQuery<DtnToItem[], AppError>({
    queryKey: ["dtnToOrderItems", params.toBuyerCode, params.toOrder],
    queryFn: async () => {
      const response: AxiosResponse<DtnToItem[]> =
        await getToOrderItems(params);
      return response.data;
    },
    enabled,
  });
};

export const useCommitDtnMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<DtnMutationResponse, AppError, DtnSubmissionPayload>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<DtnMutationResponse> =
        await commitDTN(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dtnFromStock"] });
    },
  });
};
