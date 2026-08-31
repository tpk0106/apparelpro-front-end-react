import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getGeneralStockSummaryReportHeader,
  getGeneralStockSummaryReportLines,
  downloadGeneralStockSummaryReportPdf,
  type GeneralStockSummaryReportParams,
} from "../../services/reports/general-inventory/general-stock-summary-report.service";
import type {
  GeneralStockSummaryReportHeader,
  GeneralStockSummaryReportLine,
} from "../../interfaces/general-inventory/general-stock-summary-report.types";

export const useGetGeneralStockSummaryReportHeaderQuery = (
  params: GeneralStockSummaryReportParams,
  enabled: boolean,
) => {
  return useQuery<GeneralStockSummaryReportHeader, AppError>({
    queryKey: ["generalStockSummaryReportHeader", params],
    queryFn: async () => {
      const response: AxiosResponse<GeneralStockSummaryReportHeader> =
        await getGeneralStockSummaryReportHeader(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useGetGeneralStockSummaryReportLinesQuery = (
  params: GeneralStockSummaryReportParams,
  enabled: boolean,
) => {
  return useQuery<GeneralStockSummaryReportLine[], AppError>({
    queryKey: ["generalStockSummaryReportLines", params],
    queryFn: async () => {
      const response: AxiosResponse<GeneralStockSummaryReportLine[]> =
        await getGeneralStockSummaryReportLines(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadGeneralStockSummaryReportPdfMutation = () => {
  return useMutation<void, AppError, GeneralStockSummaryReportParams>({
    mutationFn: async (params) => {
      const response = await downloadGeneralStockSummaryReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `General_Stock_Summary_${params.year}${String(params.month).padStart(2, "0")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
