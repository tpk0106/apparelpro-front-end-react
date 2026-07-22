import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getStockMovementReportHeader,
  getStockMovementReportLines,
  downloadStockMovementReportPdf,
} from "../services/stock-movement-report.service";
import type {
  StockMovementReportHeader,
  StockMovementReportLine,
  StockMovementReportLinesQueryParams,
} from "../components/orderwise-inventory/stock-movement-report.types";
import type { PaginationAPIModel } from "../interfaces/references/ApiResult";

export const useGetStockMovementReportHeaderQuery = (
  buyerCode: number,
  order: string,
  enabled: boolean,
) => {
  return useQuery<StockMovementReportHeader, AppError>({
    queryKey: ["stockMovementReportHeader", buyerCode, order],
    queryFn: async () => {
      const response: AxiosResponse<StockMovementReportHeader> =
        await getStockMovementReportHeader(buyerCode, order);
      return response.data;
    },
    enabled,
  });
};

export const useGetStockMovementReportLinesQuery = (
  params: StockMovementReportLinesQueryParams,
  enabled: boolean,
) => {
  return useQuery<PaginationAPIModel<StockMovementReportLine>, AppError>({
    queryKey: [
      "stockMovementReportLines",
      params.buyerCode,
      params.order,
      params.currentPage,
      params.pageSize,
      params.sortColumn,
      params.sortOrder,
      params.filterColumn,
      params.filterQuery,
    ],
    queryFn: async () => {
      const response: AxiosResponse<PaginationAPIModel<StockMovementReportLine>> =
        await getStockMovementReportLines(params);
      return response.data;
    },
    enabled,
    placeholderData: (previousData) => previousData, // smooth page/sort/filter transitions
  });
};

// PDF export is a one-shot side effect, not cached data — modelled as a mutation
// that triggers a browser download from the returned blob.
export const useDownloadStockMovementReportPdfMutation = () => {
  return useMutation<void, AppError, { buyerCode: number; order: string }>({
    mutationFn: async ({ buyerCode, order }) => {
      const response = await downloadStockMovementReportPdf(buyerCode, order);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `StockMovementReport_${buyerCode}_${order}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
