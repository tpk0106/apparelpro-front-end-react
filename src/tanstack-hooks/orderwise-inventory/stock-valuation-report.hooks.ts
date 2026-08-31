import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getStockValuationReportHeader,
  getStockValuationReportLines,
  downloadStockValuationReportPdf,
  type StockValuationReportParams,
} from "../../services/reports/orderwise-inventory/stock-valuation-report.service";
import type {
  StockValuationReportHeader,
  StockValuationReportLine,
} from "../../interfaces/orderwise-inventory/stock-valuation-report.types";

export const useGetStockValuationReportHeaderQuery = (
  params: StockValuationReportParams,
  enabled: boolean,
) => {
  return useQuery<StockValuationReportHeader, AppError>({
    queryKey: ["stockValuationReportHeader", params],
    queryFn: async () => {
      const response: AxiosResponse<StockValuationReportHeader> =
        await getStockValuationReportHeader(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useGetStockValuationReportLinesQuery = (
  params: StockValuationReportParams,
  enabled: boolean,
) => {
  return useQuery<StockValuationReportLine[], AppError>({
    queryKey: ["stockValuationReportLines", params],
    queryFn: async () => {
      const response: AxiosResponse<StockValuationReportLine[]> =
        await getStockValuationReportLines(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadStockValuationReportPdfMutation = () => {
  return useMutation<void, AppError, StockValuationReportParams>({
    mutationFn: async (params) => {
      const response = await downloadStockValuationReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Stock_Valuation_${params.buyerCode}_${params.order}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
