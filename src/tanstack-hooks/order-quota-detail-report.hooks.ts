import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getOrderQuotaDetailReportDetails,
  downloadOrderQuotaDetailReportPdf,
  type OrderQuotaDetailReportQueryParams,
} from "../services/reports/order-management/order-quota-detail-report.service";
import type { OrderQuotaDetailReport } from "../components/reports/order-management/order-quota-detail-report/order-quota-detail-report.types";

export const useGetOrderQuotaDetailReportDetailsQuery = (
  params: OrderQuotaDetailReportQueryParams,
  enabled: boolean,
) => {
  return useQuery<OrderQuotaDetailReport, AppError>({
    queryKey: ["orderQuotaDetailReportDetails", params],
    queryFn: async () => {
      const response: AxiosResponse<OrderQuotaDetailReport> =
        await getOrderQuotaDetailReportDetails(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadOrderQuotaDetailReportPdfMutation = () => {
  return useMutation<void, AppError, OrderQuotaDetailReportQueryParams>({
    mutationFn: async (params) => {
      const response = await downloadOrderQuotaDetailReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "OrderQuotaDetailReport.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
