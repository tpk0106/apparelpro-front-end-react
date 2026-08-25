import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  commitGeneralPO,
  getGeneralPurchaseOrder,
} from "../../services/general-inventory/general-po.service";
import type {
  GeneralPOSubmissionPayload,
  GeneralPoCommitResult,
} from "../../interfaces/general-inventory/general-po.types";

export const useCreateGeneralPOMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<GeneralPoCommitResult, AppError, GeneralPOSubmissionPayload>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<GeneralPoCommitResult> =
        await commitGeneralPO(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["generalInventoryStrnChoices"],
      });
    },
  });
};

export const useGetGeneralPurchaseOrderQuery = (
  poNumber: string,
  enabled: boolean,
) => {
  return useQuery<GeneralPOSubmissionPayload, AppError>({
    queryKey: ["generalPurchaseOrder", poNumber],
    queryFn: async () => {
      const response: AxiosResponse<GeneralPOSubmissionPayload> =
        await getGeneralPurchaseOrder(poNumber);
      return response.data;
    },
    enabled,
    retry: false,
  });
};
