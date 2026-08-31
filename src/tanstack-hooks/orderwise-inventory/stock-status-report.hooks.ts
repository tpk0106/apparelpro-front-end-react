import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getStockStatusReportHeader,
  getStockStatusReportLines,
  downloadStockStatusReportPdf,
  type StockStatusReportParams,
} from "../../services/reports/orderwise-inventory/stock-status-report.service";
import type {
  StockStatusReportHeader,
  StockStatusReportLine,
} from "../../interfaces/orderwise-inventory/stock-status-report.types";

export const useGetStockStatusReportHeaderQuery = (params: StockStatusReportParams, enabled: boolean) => {
  return useQuery<StockStatusReportHeader, AppError>({
    queryKey: ["orderwiseStockStatusReportHeader", params],
    queryFn: async () => {
      const response: AxiosResponse<StockStatusReportHeader> = await getStockStatusReportHeader(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useGetStockStatusReportLinesQuery = (params: StockStatusReportParams, enabled: boolean) => {
  return useQuery<StockStatusReportLine[], AppError>({
    queryKey: ["orderwiseStockStatusReportLines", params],
    queryFn: async () => {
      const response: AxiosResponse<StockStatusReportLine[]> = await getStockStatusReportLines(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadStockStatusReportPdfMutation = () => {
  return useMutation<void, AppError, StockStatusReportParams>({
    mutationFn: async (params) => {
      const response = await downloadStockStatusReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Orderwise_Stock_Status_${params.buyerCode}_${params.order}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
