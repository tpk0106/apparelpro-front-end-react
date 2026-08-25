import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getIssuableStrnLines,
  commitGeneralGin,
} from "../../services/general-inventory/general-gin.service";
import type {
  GeneralGinStrnLookupResult,
  GeneralGinSubmissionPayload,
  GeneralGinMutationResponse,
} from "../../interfaces/general-inventory/general-gin.types";

export const useGetIssuableStrnLinesQuery = (
  strnNumber: string,
  enabled: boolean,
) => {
  return useQuery<GeneralGinStrnLookupResult, AppError>({
    queryKey: ["generalGinIssuableLines", strnNumber],
    queryFn: async () => {
      const response: AxiosResponse<GeneralGinStrnLookupResult> =
        await getIssuableStrnLines(strnNumber);
      return response.data;
    },
    enabled,
  });
};

export const useCommitGeneralGinMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    GeneralGinMutationResponse,
    AppError,
    GeneralGinSubmissionPayload
  >({
    mutationFn: async (payload) => {
      const response: AxiosResponse<GeneralGinMutationResponse> =
        await commitGeneralGin(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generalGinIssuableLines"] });
      queryClient.invalidateQueries({ queryKey: ["generalStores"] });
    },
  });
};
