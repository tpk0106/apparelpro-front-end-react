import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getReceivableLinesByPo,
  commitGeneralGrn,
} from "../../services/general-inventory/general-grn.service";
import type {
  GeneralGrnPoLookupResult,
  GeneralGrnSubmissionPayload,
  GeneralGrnMutationResponse,
} from "../../interfaces/general-inventory/general-grn.types";

export const useGetReceivableLinesByPoQuery = (
  poNumber: string,
  enabled: boolean,
) => {
  return useQuery<GeneralGrnPoLookupResult, AppError>({
    queryKey: ["generalGrnReceivableLines", poNumber],
    queryFn: async () => {
      const response: AxiosResponse<GeneralGrnPoLookupResult> =
        await getReceivableLinesByPo(poNumber);
      return response.data;
    },
    enabled,
  });
};

export const useCommitGeneralGrnMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    GeneralGrnMutationResponse,
    AppError,
    GeneralGrnSubmissionPayload
  >({
    mutationFn: async (payload) => {
      const response: AxiosResponse<GeneralGrnMutationResponse> =
        await commitGeneralGrn(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generalGrnReceivableLines"] });
      queryClient.invalidateQueries({ queryKey: ["generalStores"] });
    },
  });
};
