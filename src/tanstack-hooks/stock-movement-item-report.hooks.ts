import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getStockMovementItemOptions,
  getStockMovementItemReportHeader,
  getStockMovementItemReportLines,
  downloadStockMovementItemReportPdf,
} from "../services/stock-movement-item-report.service";
import type {
  StockMovementItemOption,
  StockMovementItemReportHeader,
  StockMovementItemReportLine,
  StockMovementItemReportLinesQueryParams,
} from "../components/orderwise-inventory/stock-movement-item-report.types";
import type { PaginationAPIModel } from "../interfaces/references/ApiResult";

export const useGetStockMovementItemOptionsQuery = (
  buyerCode: number,
  order: string,
  enabled: boolean,
) => {
  return useQuery<StockMovementItemOption[], AppError>({
    queryKey: ["stockMovementItemOptions", buyerCode, order],
    queryFn: async () => {
      const response: AxiosResponse<StockMovementItemOption[]> =
        await getStockMovementItemOptions(buyerCode, order);
      return response.data;
    },
    enabled,
  });
};

export const useGetStockMovementItemReportHeaderQuery = (
  buyerCode: number,
  order: string,
  itemCode: string,
  enabled: boolean,
) => {
  return useQuery<StockMovementItemReportHeader, AppError>({
    queryKey: ["stockMovementItemReportHeader", buyerCode, order, itemCode],
    queryFn: async () => {
      const response: AxiosResponse<StockMovementItemReportHeader> =
        await getStockMovementItemReportHeader(buyerCode, order, itemCode);
      return response.data;
    },
    enabled,
  });
};

export const useGetStockMovementItemReportLinesQuery = (
  params: StockMovementItemReportLinesQueryParams,
  enabled: boolean,
) => {
  return useQuery<PaginationAPIModel<StockMovementItemReportLine>, AppError>({
    queryKey: [
      "stockMovementItemReportLines",
      params.buyerCode,
      params.order,
      params.itemCode,
      params.currentPage,
      params.pageSize,
    ],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<StockMovementItemReportLine>> =
        await getStockMovementItemReportLines(params);
      return response.data;
    },
    enabled,
    placeholderData: (previousData) => previousData, // smooth page transitions
  });
};

// PDF export is a one-shot side effect, not cached data — modelled as a mutation
// that triggers a browser download from the returned blob.
export const useDownloadStockMovementItemReportPdfMutation = () => {
  return useMutation<
    void,
    AppError,
    { buyerCode: number; order: string; itemCode: string }
  >({
    mutationFn: async ({ buyerCode, order, itemCode }) => {
      const response = await downloadStockMovementItemReportPdf(buyerCode, order, itemCode);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `StockMovementItemReport_${buyerCode}_${order}_${itemCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
