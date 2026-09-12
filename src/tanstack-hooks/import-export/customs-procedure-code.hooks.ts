import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { CustomsProcedureCode } from "../../interfaces/import-export/ImportExport";
import {
  loadCustomsProcedureCodes,
  createCustomsProcedureCode,
  updateCustomsProcedureCode,
  deleteCustomsProcedureCode,
} from "../../services/import-export/customs-procedure-code.service";

const CUSTOMS_PROCEDURE_CODE_QUERY_KEY = ["importExport", "customsProcedureCodes"];

export const useGetCustomsProcedureCodes = () => {
  return useQuery<CustomsProcedureCode[], Error>({
    queryKey: CUSTOMS_PROCEDURE_CODE_QUERY_KEY,
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<CustomsProcedureCode>> = await loadCustomsProcedureCodes();
      return response.data.items;
    },
  });
};

export const useSaveCustomsProcedureCode = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, { payload: CustomsProcedureCode; isNew: boolean }>({
    mutationFn: async ({ payload, isNew }) => {
      if (isNew) {
        await createCustomsProcedureCode(payload);
      } else {
        await updateCustomsProcedureCode(payload.code, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMS_PROCEDURE_CODE_QUERY_KEY });
    },
  });
};

export const useDeleteCustomsProcedureCode = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, string>({
    mutationFn: async (code) => {
      await deleteCustomsProcedureCode(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMS_PROCEDURE_CODE_QUERY_KEY });
    },
  });
};
