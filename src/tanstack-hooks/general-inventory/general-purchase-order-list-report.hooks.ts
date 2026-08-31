import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getGeneralPurchaseOrderListReportHeader,
  getGeneralPurchaseOrderListReportLines,
  downloadGeneralPurchaseOrderListReportPdf,
  type GeneralPurchaseOrderListReportParams,
} from "../../services/reports/general-inventory/general-purchase-order-list-report.service";
import type {
  GeneralPurchaseOrderListReportHeader,
  GeneralPurchaseOrderListReportLine,
} from "../../interfaces/general-inventory/general-purchase-order-list-report.types";

export const useGetGeneralPurchaseOrderListReportHeaderQuery = (
  params: GeneralPurchaseOrderListReportParams,
  enabled: boolean,
) => {
  return useQuery<GeneralPurchaseOrderListReportHeader, AppError>({
    queryKey: ["generalPurchaseOrderListReportHeader", params],
    queryFn: async () => {
      const response: AxiosResponse<GeneralPurchaseOrderListReportHeader> =
        await getGeneralPurchaseOrderListReportHeader(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useGetGeneralPurchaseOrderListReportLinesQuery = (
  params: GeneralPurchaseOrderListReportParams,
  enabled: boolean,
) => {
  return useQuery<GeneralPurchaseOrderListReportLine[], AppError>({
    queryKey: ["generalPurchaseOrderListReportLines", params],
    queryFn: async () => {
      const response: AxiosResponse<GeneralPurchaseOrderListReportLine[]> =
        await getGeneralPurchaseOrderListReportLines(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadGeneralPurchaseOrderListReportPdfMutation = () => {
  return useMutation<void, AppError, GeneralPurchaseOrderListReportParams>({
    mutationFn: async (params) => {
      const response = await downloadGeneralPurchaseOrderListReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `General_Purchase_Order_List_${params.fromDate}_${params.toDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
