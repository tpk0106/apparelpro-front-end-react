import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import { commitGeneralGTN } from "../../services/general-inventory/general-gtn.service";
import type { GeneralInventoryMutationResponse } from "../../interfaces/general-inventory/general-inventory.types";
import type { GeneralGtnSubmissionPayload } from "../../interfaces/general-inventory/general-gtn.types";

export const useCreateGeneralGTNMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GeneralInventoryMutationResponse,
    AppError,
    GeneralGtnSubmissionPayload
  >({
    mutationFn: async (payload) => {
      const response: AxiosResponse<GeneralInventoryMutationResponse> =
        await commitGeneralGTN(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["generalInventoryStrnChoices"],
      });
    },
  });
};
