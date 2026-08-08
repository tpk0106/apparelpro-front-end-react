import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getTransferableStock,
  commitGTN,
} from "../services/orderwise-inventory/goods-transfer-note.service";
import type {
  GtnTransferableStockRow,
  GtnSubmissionPayload,
  GtnMutationResponse,
} from "../components/orderwise-inventory/goods-transfer-note.types";

// Cascade lookup: fires once From Buyer+Order AND To Buyer+Order are all selected.
// queryKey deliberately spells out every real parameter value (not a literal string
// standing in for one) — this is the exact bug we fixed in
// useGetAllPurchaseOrdersByBuyerCode earlier: a queryKey missing a real dependency
// value means React Query treats different lookups as the same cache entry and never
// refetches when From/To Buyer or Order changes.
export const useGetTransferableStockQuery = (
  params: {
    fromBuyerCode: number;
    fromOrder: string;
    toBuyerCode: number;
    toOrder: string;
  },
  enabled: boolean,
) => {
  return useQuery<GtnTransferableStockRow[], AppError>({
    queryKey: [
      "gtnTransferableStock",
      params.fromBuyerCode,
      params.fromOrder,
      params.toBuyerCode,
      params.toOrder,
    ],
    queryFn: async () => {
      const response: AxiosResponse<GtnTransferableStockRow[]> =
        await getTransferableStock(params);
      return response.data;
    },
    enabled,
  });
};

export const useCommitGtnMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<GtnMutationResponse, AppError, GtnSubmissionPayload>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<GtnMutationResponse> =
        await commitGTN(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gtnTransferableStock"] });
    },
  });
};
