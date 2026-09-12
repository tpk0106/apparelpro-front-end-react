import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { TaxBaseCode } from "../../interfaces/import-export/ImportExport";
import {
  loadTaxBaseCodes,
  createTaxBaseCode,
  updateTaxBaseCode,
  deleteTaxBaseCode,
} from "../../services/import-export/tax-base-code.service";

const TAX_BASE_CODE_QUERY_KEY = ["importExport", "taxBaseCodes"];

export const useGetTaxBaseCodes = () => {
  return useQuery<TaxBaseCode[], Error>({
    queryKey: TAX_BASE_CODE_QUERY_KEY,
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<TaxBaseCode>> = await loadTaxBaseCodes();
      return response.data.items;
    },
  });
};

export const useSaveTaxBaseCode = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, { payload: TaxBaseCode; isNew: boolean }>({
    mutationFn: async ({ payload, isNew }) => {
      if (isNew) {
        await createTaxBaseCode(payload);
      } else {
        await updateTaxBaseCode(payload.code, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_BASE_CODE_QUERY_KEY });
    },
  });
};

export const useDeleteTaxBaseCode = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, string>({
    mutationFn: async (code) => {
      await deleteTaxBaseCode(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_BASE_CODE_QUERY_KEY });
    },
  });
};
