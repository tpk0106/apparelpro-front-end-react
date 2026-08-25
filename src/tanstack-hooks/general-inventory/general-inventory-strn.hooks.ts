import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  verifyStockItemAvailability,
  createGeneralSTRN,
  getAvailableStockChoices,
  getStores,
} from "../../services/general-inventory/general-inventory-strn.service";
import type {
  GeneralStockItemAvailability,
  GeneralRequisitionSubmissionPayload,
  VerifyGeneralStockQueryParams,
  GeneralInventoryMutationResponse,
  GeneralStockLookupRow,
  GeneralStore,
} from "../../interfaces/general-inventory/general-inventory.types";

export const useVerifyGeneralStockItemAvailabilityMutation = () => {
  return useMutation<
    GeneralStockItemAvailability,
    AppError,
    VerifyGeneralStockQueryParams
  >({
    mutationFn: async (params) => {
      const response: AxiosResponse<GeneralStockItemAvailability> =
        await verifyStockItemAvailability(params);
      return response.data;
    },
  });
};

export const useCreateGeneralSTRNMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GeneralInventoryMutationResponse,
    AppError,
    GeneralRequisitionSubmissionPayload
  >({
    mutationFn: async (payload) => {
      const response: AxiosResponse<GeneralInventoryMutationResponse> =
        await createGeneralSTRN(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["generalInventoryStrnChoices"],
      });
    },
  });
};

export const useGetAvailableGeneralStockChoicesQuery = (
  storeCode: string,
  enabled: boolean,
) => {
  return useQuery<GeneralStockLookupRow[], AppError>({
    queryKey: ["generalInventoryStrnChoices", storeCode],
    queryFn: async () => {
      const response: AxiosResponse<GeneralStockLookupRow[]> =
        await getAvailableStockChoices({ storeCode });
      return response.data;
    },
    enabled,
  });
};

export const useGetGeneralStoresQuery = () => {
  return useQuery<GeneralStore[], AppError>({
    queryKey: ["generalStores"],
    queryFn: async () => {
      const response: AxiosResponse<GeneralStore[]> = await getStores();
      return response.data;
    },
  });
};
