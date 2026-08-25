import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getTransferableStock,
  commitOrderGTN,
} from "../../services/general-inventory/general-ogtn.service";
import type { GeneralInventoryMutationResponse } from "../../interfaces/general-inventory/general-inventory.types";
import type {
  OrderGtnSubmissionPayload,
  OrderGtnTransferableStockRow,
  OrderGtnDirectionType,
} from "../../interfaces/general-inventory/general-ogtn.types";

export const useGetOrderGtnTransferableStockQuery = (
  params: {
    direction: OrderGtnDirectionType;
    storeCode: string;
    buyerCode: number;
    order: string;
  },
  enabled: boolean,
) => {
  return useQuery<OrderGtnTransferableStockRow[], AppError>({
    queryKey: ["orderGtnTransferableStock", params],
    queryFn: async () => {
      const response: AxiosResponse<OrderGtnTransferableStockRow[]> =
        await getTransferableStock(params);
      return response.data;
    },
    enabled,
  });
};

export const useCreateOrderGTNMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GeneralInventoryMutationResponse,
    AppError,
    OrderGtnSubmissionPayload
  >({
    mutationFn: async (payload) => {
      const response: AxiosResponse<GeneralInventoryMutationResponse> =
        await commitOrderGTN(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orderGtnTransferableStock"],
      });
    },
  });
};
