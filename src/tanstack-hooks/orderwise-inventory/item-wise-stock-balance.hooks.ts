import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getItemWiseStockBalanceHeader,
  getItemWiseStockBalanceLines,
  downloadItemWiseStockBalancePdf,
  type ItemWiseStockBalanceParams,
} from "../../services/reports/orderwise-inventory/item-wise-stock-balance.service";
import type {
  ItemWiseStockBalanceHeader,
  ItemWiseStockBalanceLine,
} from "../../interfaces/orderwise-inventory/item-wise-stock-balance.types";

export const useGetItemWiseStockBalanceHeaderQuery = (params: ItemWiseStockBalanceParams, enabled: boolean) => {
  return useQuery<ItemWiseStockBalanceHeader, AppError>({
    queryKey: ["itemWiseStockBalanceHeader", params],
    queryFn: async () => {
      const response: AxiosResponse<ItemWiseStockBalanceHeader> = await getItemWiseStockBalanceHeader(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useGetItemWiseStockBalanceLinesQuery = (params: ItemWiseStockBalanceParams, enabled: boolean) => {
  return useQuery<ItemWiseStockBalanceLine[], AppError>({
    queryKey: ["itemWiseStockBalanceLines", params],
    queryFn: async () => {
      const response: AxiosResponse<ItemWiseStockBalanceLine[]> = await getItemWiseStockBalanceLines(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadItemWiseStockBalancePdfMutation = () => {
  return useMutation<void, AppError, ItemWiseStockBalanceParams>({
    mutationFn: async (params) => {
      const response = await downloadItemWiseStockBalancePdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Item_Wise_Stock_Balances_${params.fromRange}_${params.toRange}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
