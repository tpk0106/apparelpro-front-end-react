import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getGeneralStockStatusReportHeader,
  getGeneralStockStatusReportLines,
  downloadGeneralStockStatusReportPdf,
  type GeneralStockStatusReportParams,
} from "../../services/reports/general-inventory/general-stock-status-report.service";
import type {
  GeneralStockStatusReportHeader,
  GeneralStockStatusReportLine,
} from "../../interfaces/general-inventory/general-stock-status-report.types";

export const useGetGeneralStockStatusReportHeaderQuery = (
  params: GeneralStockStatusReportParams,
  enabled: boolean,
) => {
  return useQuery<GeneralStockStatusReportHeader, AppError>({
    queryKey: ["generalStockStatusReportHeader", params],
    queryFn: async () => {
      const response: AxiosResponse<GeneralStockStatusReportHeader> =
        await getGeneralStockStatusReportHeader(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useGetGeneralStockStatusReportLinesQuery = (
  params: GeneralStockStatusReportParams,
  enabled: boolean,
) => {
  return useQuery<GeneralStockStatusReportLine[], AppError>({
    queryKey: ["generalStockStatusReportLines", params],
    queryFn: async () => {
      const response: AxiosResponse<GeneralStockStatusReportLine[]> =
        await getGeneralStockStatusReportLines(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadGeneralStockStatusReportPdfMutation = () => {
  return useMutation<void, AppError, GeneralStockStatusReportParams>({
    mutationFn: async (params) => {
      const response = await downloadGeneralStockStatusReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `General_Stock_Status_${params.storeCode}_${params.year}${String(params.month).padStart(2, "0")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
