import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  commitGeneralStockMaster,
  updateGeneralStockMaster,
  getGeneralStockMastersByStore,
  deleteGeneralStockMaster,
} from "../../services/general-inventory/general-stock-master.service";
import type { GeneralInventoryMutationResponse } from "../../interfaces/general-inventory/general-inventory.types";
import type {
  GeneralStockMasterEntryPayload,
  GeneralStockMasterUpdatePayload,
  GeneralStockMasterRow,
} from "../../interfaces/general-inventory/general-stock-master.types";

export const useGetGeneralStockMastersByStoreQuery = (
  storeCode: string,
  enabled: boolean,
) => {
  return useQuery<GeneralStockMasterRow[], AppError>({
    queryKey: ["generalStockMastersByStore", storeCode],
    queryFn: async () => {
      const response: AxiosResponse<GeneralStockMasterRow[]> =
        await getGeneralStockMastersByStore(storeCode);
      return response.data;
    },
    enabled,
  });
};

export const useCreateGeneralStockMasterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GeneralInventoryMutationResponse,
    AppError,
    GeneralStockMasterEntryPayload
  >({
    mutationFn: async (payload) => {
      const response: AxiosResponse<GeneralInventoryMutationResponse> =
        await commitGeneralStockMaster(payload);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["generalStockMastersByStore", variables.storeCode],
      });
      queryClient.invalidateQueries({ queryKey: ["generalInventoryStrnChoices"] });
    },
  });
};

export const useUpdateGeneralStockMasterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GeneralInventoryMutationResponse,
    AppError,
    GeneralStockMasterUpdatePayload
  >({
    mutationFn: async (payload) => {
      const response: AxiosResponse<GeneralInventoryMutationResponse> =
        await updateGeneralStockMaster(payload);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["generalStockMastersByStore", variables.storeCode],
      });
      queryClient.invalidateQueries({ queryKey: ["generalInventoryStrnChoices"] });
    },
  });
};

export const useDeleteGeneralStockMasterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GeneralInventoryMutationResponse,
    AppError,
    { storeCode: string; itemCode: string }
  >({
    mutationFn: async ({ storeCode, itemCode }) => {
      const response: AxiosResponse<GeneralInventoryMutationResponse> =
        await deleteGeneralStockMaster(storeCode, itemCode);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["generalStockMastersByStore", variables.storeCode],
      });
      queryClient.invalidateQueries({ queryKey: ["generalInventoryStrnChoices"] });
    },
  });
};
