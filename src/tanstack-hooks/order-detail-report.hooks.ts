import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getOrderDetailReportDetails,
  downloadOrderDetailReportPdf,
  type OrderDetailReportQueryParams,
} from "../services/reports/order-management/order-detail-report.service";
import type { OrderDetailReport } from "../components/reports/order-management/order-detail-report/order-detail-report.types";

export const useGetOrderDetailReportDetailsQuery = (
  params: OrderDetailReportQueryParams,
  enabled: boolean,
) => {
  return useQuery<OrderDetailReport, AppError>({
    queryKey: ["orderDetailReportDetails", params],
    queryFn: async () => {
      const response: AxiosResponse<OrderDetailReport> =
        await getOrderDetailReportDetails(params);
      return response.data;
    },
    enabled,
    // A "buyer/order not found" response is an expected data-state outcome, not a
    // transient network fault - don't burn retries on it (same reasoning as Trim
    // Sheet Report's identical retry: false).
    retry: false,
  });
};

// PDF export is a one-shot side effect, not cached data - modelled as a mutation that
// triggers a browser download from the returned blob.
export const useDownloadOrderDetailReportPdfMutation = () => {
  return useMutation<void, AppError, OrderDetailReportQueryParams>({
    mutationFn: async (params) => {
      const response = await downloadOrderDetailReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `OrderDetail_${params.order}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
