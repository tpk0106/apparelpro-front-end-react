import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { CommodityCode } from "../../interfaces/import-export/ImportExport";
import {
  loadCommodityCodes,
  createCommodityCode,
  updateCommodityCode,
  deleteCommodityCode,
} from "../../services/import-export/commodity-code.service";

const COMMODITY_CODE_QUERY_KEY = ["importExport", "commodityCodes"];

export const useGetCommodityCodes = () => {
  return useQuery<CommodityCode[], Error>({
    queryKey: COMMODITY_CODE_QUERY_KEY,
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<CommodityCode>> = await loadCommodityCodes();
      return response.data.items;
    },
  });
};

export const useSaveCommodityCode = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, { payload: CommodityCode; isNew: boolean }>({
    mutationFn: async ({ payload, isNew }) => {
      if (isNew) {
        await createCommodityCode(payload);
      } else {
        await updateCommodityCode(payload.code, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMODITY_CODE_QUERY_KEY });
    },
  });
};

export const useDeleteCommodityCode = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, string>({
    mutationFn: async (code) => {
      await deleteCommodityCode(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMMODITY_CODE_QUERY_KEY });
    },
  });
};
