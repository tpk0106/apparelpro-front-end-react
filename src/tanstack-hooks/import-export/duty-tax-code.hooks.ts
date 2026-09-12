import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { DutyTaxCode } from "../../interfaces/import-export/ImportExport";
import {
  loadDutyTaxCodes,
  createDutyTaxCode,
  updateDutyTaxCode,
  deleteDutyTaxCode,
} from "../../services/import-export/duty-tax-code.service";

const DUTY_TAX_CODE_QUERY_KEY = ["importExport", "dutyTaxCodes"];

export const useGetDutyTaxCodes = () => {
  return useQuery<DutyTaxCode[], Error>({
    queryKey: DUTY_TAX_CODE_QUERY_KEY,
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<DutyTaxCode>> = await loadDutyTaxCodes();
      return response.data.items;
    },
  });
};

export const useSaveDutyTaxCode = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, { payload: DutyTaxCode; isNew: boolean }>({
    mutationFn: async ({ payload, isNew }) => {
      if (isNew) {
        await createDutyTaxCode(payload);
      } else {
        await updateDutyTaxCode(payload.code, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DUTY_TAX_CODE_QUERY_KEY });
    },
  });
};

export const useDeleteDutyTaxCode = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, string>({
    mutationFn: async (code) => {
      await deleteDutyTaxCode(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DUTY_TAX_CODE_QUERY_KEY });
    },
  });
};
