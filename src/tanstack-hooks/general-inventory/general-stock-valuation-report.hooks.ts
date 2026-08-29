import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getGeneralStockValuationReportHeader,
  getGeneralStockValuationReportLines,
  downloadGeneralStockValuationReportPdf,
  type GeneralStockValuationReportParams,
} from "../../services/reports/general-inventory/general-stock-valuation-report.service";
import type {
  GeneralStockValuationReportHeader,
  GeneralStockValuationReportLine,
} from "../../interfaces/general-inventory/general-stock-valuation-report.types";

export const useGetGeneralStockValuationReportHeaderQuery = (
  params: GeneralStockValuationReportParams,
  enabled: boolean,
) => {
  return useQuery<GeneralStockValuationReportHeader, AppError>({
    queryKey: ["generalStockValuationReportHeader", params],
    queryFn: async () => {
      const response: AxiosResponse<GeneralStockValuationReportHeader> =
        await getGeneralStockValuationReportHeader(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useGetGeneralStockValuationReportLinesQuery = (
  params: GeneralStockValuationReportParams,
  enabled: boolean,
) => {
  return useQuery<GeneralStockValuationReportLine[], AppError>({
    queryKey: ["generalStockValuationReportLines", params],
    queryFn: async () => {
      const response: AxiosResponse<GeneralStockValuationReportLine[]> =
        await getGeneralStockValuationReportLines(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadGeneralStockValuationReportPdfMutation = () => {
  return useMutation<void, AppError, GeneralStockValuationReportParams>({
    mutationFn: async (params) => {
      const response = await downloadGeneralStockValuationReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `General_Stock_Valuation_${params.storeCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
