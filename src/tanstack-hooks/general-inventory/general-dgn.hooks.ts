import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import { commitGeneralDGN } from "../../services/general-inventory/general-dgn.service";
import type { GeneralInventoryMutationResponse } from "../../interfaces/general-inventory/general-inventory.types";
import type { GeneralDgnSubmissionPayload } from "../../interfaces/general-inventory/general-dgn.types";

export const useCreateGeneralDGNMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GeneralInventoryMutationResponse,
    AppError,
    GeneralDgnSubmissionPayload
  >({
    mutationFn: async (payload) => {
      const response: AxiosResponse<GeneralInventoryMutationResponse> =
        await commitGeneralDGN(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["generalInventoryStrnChoices"],
      });
    },
  });
};
