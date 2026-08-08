import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getOutstandingPurchaseOrderListReportDetails,
  downloadOutstandingPurchaseOrderListReportPdf,
  type OutstandingPurchaseOrderListReportQueryParams,
} from "../services/reports/order-management/outstanding-purchase-order-list-report.service";
import type { OutstandingPurchaseOrderListReport } from "../components/reports/order-management/outstanding-purchase-order-list-report/outstanding-purchase-order-list-report.types";

export const useGetOutstandingPurchaseOrderListReportDetailsQuery = (
  params: OutstandingPurchaseOrderListReportQueryParams,
  enabled: boolean,
) => {
  return useQuery<OutstandingPurchaseOrderListReport, AppError>({
    queryKey: ["outstandingPurchaseOrderListReportDetails", params],
    queryFn: async () => {
      const response: AxiosResponse<OutstandingPurchaseOrderListReport> =
        await getOutstandingPurchaseOrderListReportDetails(params);
      return response.data;
    },
    enabled,
    // A "no P/Os in this date range" response is an expected data-state outcome, not a
    // transient network fault - don't burn retries on it (same reasoning as the other
    // reports).
    retry: false,
  });
};

// PDF export is a one-shot side effect, not cached data - modelled as a mutation that
// triggers a browser download from the returned blob.
export const useDownloadOutstandingPurchaseOrderListReportPdfMutation = () => {
  return useMutation<
    void,
    AppError,
    OutstandingPurchaseOrderListReportQueryParams
  >({
    mutationFn: async (params) => {
      const response =
        await downloadOutstandingPurchaseOrderListReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `OutstandingPOList_${params.startDate}_${params.endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
