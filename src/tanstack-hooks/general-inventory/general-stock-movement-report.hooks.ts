import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getGeneralStockMovementReportHeader,
  getGeneralStockMovementReportLines,
  downloadGeneralStockMovementReportPdf,
  type GeneralStockMovementReportParams,
} from "../../services/reports/general-inventory/general-stock-movement-report.service";
import type {
  GeneralStockMovementReportHeader,
  GeneralStockMovementReportLine,
} from "../../interfaces/general-inventory/general-stock-movement-report.types";

export const useGetGeneralStockMovementReportHeaderQuery = (
  params: GeneralStockMovementReportParams,
  enabled: boolean,
) => {
  return useQuery<GeneralStockMovementReportHeader, AppError>({
    queryKey: ["generalStockMovementReportHeader", params],
    queryFn: async () => {
      const response: AxiosResponse<GeneralStockMovementReportHeader> =
        await getGeneralStockMovementReportHeader(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useGetGeneralStockMovementReportLinesQuery = (
  params: GeneralStockMovementReportParams,
  enabled: boolean,
) => {
  return useQuery<GeneralStockMovementReportLine[], AppError>({
    queryKey: ["generalStockMovementReportLines", params],
    queryFn: async () => {
      const response: AxiosResponse<GeneralStockMovementReportLine[]> =
        await getGeneralStockMovementReportLines(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadGeneralStockMovementReportPdfMutation = () => {
  return useMutation<void, AppError, GeneralStockMovementReportParams>({
    mutationFn: async (params) => {
      const response = await downloadGeneralStockMovementReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `General_Stock_Movement_${params.storeCode}_${params.itemCode}_${params.year}${String(params.month).padStart(2, "0")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
