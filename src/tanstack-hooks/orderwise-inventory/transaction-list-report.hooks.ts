import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getTransactionListReportHeader,
  getTransactionListReportLines,
  downloadTransactionListReportPdf,
  type TransactionListReportParams,
} from "../../services/reports/orderwise-inventory/transaction-list-report.service";
import type {
  TransactionListReportHeader,
  TransactionListReportLine,
} from "../../interfaces/orderwise-inventory/transaction-list-report.types";

export const useGetTransactionListReportHeaderQuery = (
  params: TransactionListReportParams,
  enabled: boolean,
) => {
  return useQuery<TransactionListReportHeader, AppError>({
    queryKey: ["orderwiseTransactionListReportHeader", params],
    queryFn: async () => {
      const response: AxiosResponse<TransactionListReportHeader> =
        await getTransactionListReportHeader(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useGetTransactionListReportLinesQuery = (
  params: TransactionListReportParams,
  enabled: boolean,
) => {
  return useQuery<TransactionListReportLine[], AppError>({
    queryKey: ["orderwiseTransactionListReportLines", params],
    queryFn: async () => {
      const response: AxiosResponse<TransactionListReportLine[]> =
        await getTransactionListReportLines(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadTransactionListReportPdfMutation = () => {
  return useMutation<void, AppError, TransactionListReportParams>({
    mutationFn: async (params) => {
      const response = await downloadTransactionListReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Orderwise_Transaction_List_${params.fromDate}_${params.toDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
