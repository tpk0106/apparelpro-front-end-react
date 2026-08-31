import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getGeneralTransactionListReportHeader,
  getGeneralTransactionListReportLines,
  downloadGeneralTransactionListReportPdf,
  type GeneralTransactionListReportParams,
} from "../../services/reports/general-inventory/general-transaction-list-report.service";
import type {
  GeneralTransactionListReportHeader,
  GeneralTransactionListReportLine,
} from "../../interfaces/general-inventory/general-transaction-list-report.types";

export const useGetGeneralTransactionListReportHeaderQuery = (
  params: GeneralTransactionListReportParams,
  enabled: boolean,
) => {
  return useQuery<GeneralTransactionListReportHeader, AppError>({
    queryKey: ["generalTransactionListReportHeader", params],
    queryFn: async () => {
      const response: AxiosResponse<GeneralTransactionListReportHeader> =
        await getGeneralTransactionListReportHeader(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useGetGeneralTransactionListReportLinesQuery = (
  params: GeneralTransactionListReportParams,
  enabled: boolean,
) => {
  return useQuery<GeneralTransactionListReportLine[], AppError>({
    queryKey: ["generalTransactionListReportLines", params],
    queryFn: async () => {
      const response: AxiosResponse<GeneralTransactionListReportLine[]> =
        await getGeneralTransactionListReportLines(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadGeneralTransactionListReportPdfMutation = () => {
  return useMutation<void, AppError, GeneralTransactionListReportParams>({
    mutationFn: async (params) => {
      const response = await downloadGeneralTransactionListReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `General_Transaction_List_${params.fromDate}_${params.toDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
