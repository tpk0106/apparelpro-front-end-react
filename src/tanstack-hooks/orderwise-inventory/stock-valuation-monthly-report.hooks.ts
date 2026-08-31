import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getStockValuationMonthlyReportHeader,
  getStockValuationMonthlyReportLines,
  downloadStockValuationMonthlyReportPdf,
  type StockValuationMonthlyReportParams,
} from "../../services/reports/orderwise-inventory/stock-valuation-monthly-report.service";
import type {
  StockValuationMonthlyReportHeader,
  StockValuationMonthlyReportLine,
} from "../../interfaces/orderwise-inventory/stock-valuation-monthly-report.types";

export const useGetStockValuationMonthlyReportHeaderQuery = (
  params: StockValuationMonthlyReportParams,
  enabled: boolean,
) => {
  return useQuery<StockValuationMonthlyReportHeader, AppError>({
    queryKey: ["stockValuationMonthlyReportHeader", params],
    queryFn: async () => {
      const response: AxiosResponse<StockValuationMonthlyReportHeader> =
        await getStockValuationMonthlyReportHeader(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useGetStockValuationMonthlyReportLinesQuery = (
  params: StockValuationMonthlyReportParams,
  enabled: boolean,
) => {
  return useQuery<StockValuationMonthlyReportLine[], AppError>({
    queryKey: ["stockValuationMonthlyReportLines", params],
    queryFn: async () => {
      const response: AxiosResponse<StockValuationMonthlyReportLine[]> =
        await getStockValuationMonthlyReportLines(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadStockValuationMonthlyReportPdfMutation = () => {
  return useMutation<void, AppError, StockValuationMonthlyReportParams>({
    mutationFn: async (params) => {
      const response = await downloadStockValuationMonthlyReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Stock_Valuation_Monthly_${params.fromDate}_${params.toDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
