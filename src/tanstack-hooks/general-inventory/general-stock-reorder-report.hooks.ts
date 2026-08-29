import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getGeneralStockReorderReportHeader,
  getGeneralStockReorderReportLines,
  downloadGeneralStockReorderReportPdf,
  type GeneralStockReorderReportParams,
} from "../../services/reports/general-inventory/general-stock-reorder-report.service";
import type {
  GeneralStockReorderReportHeader,
  GeneralStockReorderReportLine,
} from "../../interfaces/general-inventory/general-stock-reorder-report.types";

export const useGetGeneralStockReorderReportHeaderQuery = (
  params: GeneralStockReorderReportParams,
  enabled: boolean,
) => {
  return useQuery<GeneralStockReorderReportHeader, AppError>({
    queryKey: ["generalStockReorderReportHeader", params],
    queryFn: async () => {
      const response: AxiosResponse<GeneralStockReorderReportHeader> =
        await getGeneralStockReorderReportHeader(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useGetGeneralStockReorderReportLinesQuery = (
  params: GeneralStockReorderReportParams,
  enabled: boolean,
) => {
  return useQuery<GeneralStockReorderReportLine[], AppError>({
    queryKey: ["generalStockReorderReportLines", params],
    queryFn: async () => {
      const response: AxiosResponse<GeneralStockReorderReportLine[]> =
        await getGeneralStockReorderReportLines(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadGeneralStockReorderReportPdfMutation = () => {
  return useMutation<void, AppError, GeneralStockReorderReportParams>({
    mutationFn: async (params) => {
      const response = await downloadGeneralStockReorderReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `General_Stock_Reorder_${params.storeCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
