import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { AgreementCode } from "../../interfaces/import-export/ImportExport";
import {
  loadAgreementCodes,
  createAgreementCode,
  updateAgreementCode,
  deleteAgreementCode,
} from "../../services/import-export/agreement-code.service";

const AGREEMENT_CODE_QUERY_KEY = ["importExport", "agreementCodes"];

export const useGetAgreementCodes = () => {
  return useQuery<AgreementCode[], Error>({
    queryKey: AGREEMENT_CODE_QUERY_KEY,
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<AgreementCode>> = await loadAgreementCodes();
      return response.data.items;
    },
  });
};

export const useSaveAgreementCode = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, { payload: AgreementCode; isNew: boolean }>({
    mutationFn: async ({ payload, isNew }) => {
      if (isNew) {
        await createAgreementCode(payload);
      } else {
        await updateAgreementCode(payload.code, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGREEMENT_CODE_QUERY_KEY });
    },
  });
};

export const useDeleteAgreementCode = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, string>({
    mutationFn: async (code) => {
      await deleteAgreementCode(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AGREEMENT_CODE_QUERY_KEY });
    },
  });
};
