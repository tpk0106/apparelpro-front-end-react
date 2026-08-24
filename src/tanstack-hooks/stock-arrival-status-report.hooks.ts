import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getStockArrivalStatusReportDetails,
  downloadStockArrivalStatusReportPdf,
  type StockArrivalStatusReportQueryParams,
} from "../services/reports/order-management/stock-arrival-status-report.service";
import type { StockArrivalStatusReport } from "../components/reports/order-management/stock-arrival-status-report/stock-arrival-status-report.types";

export const useGetStockArrivalStatusReportDetailsQuery = (
  params: StockArrivalStatusReportQueryParams,
  enabled: boolean,
) => {
  return useQuery<StockArrivalStatusReport, AppError>({
    queryKey: ["stockArrivalStatusReportDetails", params],
    queryFn: async () => {
      const response: AxiosResponse<StockArrivalStatusReport> =
        await getStockArrivalStatusReportDetails(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadStockArrivalStatusReportPdfMutation = () => {
  return useMutation<void, AppError, StockArrivalStatusReportQueryParams>({
    mutationFn: async (params) => {
      const response = await downloadStockArrivalStatusReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "StockArrivalStatusReport.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
