import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import { commitGeneralSRTN } from "../../services/general-inventory/general-srtn.service";
import type { GeneralInventoryMutationResponse } from "../../interfaces/general-inventory/general-inventory.types";
import type { GeneralSrtnSubmissionPayload } from "../../interfaces/general-inventory/general-srtn.types";

export const useCreateGeneralSRTNMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GeneralInventoryMutationResponse,
    AppError,
    GeneralSrtnSubmissionPayload
  >({
    mutationFn: async (payload) => {
      const response: AxiosResponse<GeneralInventoryMutationResponse> =
        await commitGeneralSRTN(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["generalInventoryStrnChoices"],
      });
    },
  });
};
