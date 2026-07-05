import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  verifyStockItemAvailability,
  createSTRN,
  getAvailableStockChoices,
} from "../services/orderwise-inventory-strn.service";
import type {
  StockItemAvailabilityDetails,
  RequisitionSubmissionPayload,
  VerifyStockQueryParams,
  InventoryMutationResponse,
  StockLookupRow,
} from "../components/orderwise-inventory/orderwise-inventory.types";

// Imperative on-blur stock balance check (replaces useLazyVerifyStockItemAvailabilityQuery)
export const useVerifyStockItemAvailabilityMutation = () => {
  return useMutation<
    StockItemAvailabilityDetails,
    AppError,
    VerifyStockQueryParams
  >({
    mutationFn: async (params) => {
      const response: AxiosResponse<StockItemAvailabilityDetails> =
        await verifyStockItemAvailability(params);
      return response.data;
    },
  });
};

// Commit STRN header + lines (replaces useCreateSRNMutation)
export const useCreateSTRNMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    InventoryMutationResponse,
    AppError,
    RequisitionSubmissionPayload
  >({
    mutationFn: async (payload) => {
      const response: AxiosResponse<InventoryMutationResponse> =
        await createSTRN(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orderwiseInventoryStrnChoices"],
      });
    },
  });
};

// Available item lookup choices for the line grid dropdown (replaces useGetAvailableStockChoicesQuery)
export const useGetAvailableStockChoicesQuery = (
  params: { buyerCode: number; order: string; storeCode: string },
  enabled: boolean,
) => {
  return useQuery<StockLookupRow[], AppError>({
    queryKey: [
      "orderwiseInventoryStrnChoices",
      params.buyerCode,
      params.order,
      params.storeCode,
    ],
    queryFn: async () => {
      const response: AxiosResponse<StockLookupRow[]> =
        await getAvailableStockChoices(params);
      return response.data;
    },
    enabled,
  });
};
