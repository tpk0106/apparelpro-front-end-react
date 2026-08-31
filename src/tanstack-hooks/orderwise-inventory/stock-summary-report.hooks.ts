import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getStockSummaryReportHeader,
  getStockSummaryReportLines,
  downloadStockSummaryReportPdf,
  type StockSummaryReportParams,
} from "../../services/reports/orderwise-inventory/stock-summary-report.service";
import type {
  StockSummaryReportHeader,
  StockSummaryReportLine,
} from "../../interfaces/orderwise-inventory/stock-summary-report.types";

export const useGetStockSummaryReportHeaderQuery = (params: StockSummaryReportParams, enabled: boolean) => {
  return useQuery<StockSummaryReportHeader, AppError>({
    queryKey: ["orderwiseStockSummaryReportHeader", params],
    queryFn: async () => {
      const response: AxiosResponse<StockSummaryReportHeader> = await getStockSummaryReportHeader(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useGetStockSummaryReportLinesQuery = (params: StockSummaryReportParams, enabled: boolean) => {
  return useQuery<StockSummaryReportLine[], AppError>({
    queryKey: ["orderwiseStockSummaryReportLines", params],
    queryFn: async () => {
      const response: AxiosResponse<StockSummaryReportLine[]> = await getStockSummaryReportLines(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadStockSummaryReportPdfMutation = () => {
  return useMutation<void, AppError, StockSummaryReportParams>({
    mutationFn: async (params) => {
      const response = await downloadStockSummaryReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Orderwise_Stock_Summary_${params.currency1}_${params.currency2}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
