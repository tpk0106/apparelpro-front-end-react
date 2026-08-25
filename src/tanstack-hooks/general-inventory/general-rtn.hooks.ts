import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import { commitGeneralRTN } from "../../services/general-inventory/general-rtn.service";
import type { GeneralInventoryMutationResponse } from "../../interfaces/general-inventory/general-inventory.types";
import type { GeneralRtnSubmissionPayload } from "../../interfaces/general-inventory/general-rtn.types";

export const useCreateGeneralRTNMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GeneralInventoryMutationResponse,
    AppError,
    GeneralRtnSubmissionPayload
  >({
    mutationFn: async (payload) => {
      const response: AxiosResponse<GeneralInventoryMutationResponse> =
        await commitGeneralRTN(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["generalInventoryStrnChoices"],
      });
    },
  });
};
