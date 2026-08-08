import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getPurchaseOrderNumbers,
  getPurchaseOrderListReportDetails,
  downloadPurchaseOrderListReportPdf,
} from "../services/reports/order-management/purchase-order-list-report.service";
import type { PurchaseOrderListReport } from "../components/reports/order-management/purchase-order-list-report/purchase-order-list-report.types";

// Backs the P/O Number Autocomplete (a deliberate modernization of OD_POLST.PRG's
// masked free-text input) - a small, mostly-static lookup list, so a long staleTime
// avoids refetching it on every header mount.
export const useGetPurchaseOrderNumbersQuery = () => {
  return useQuery<string[], AppError>({
    queryKey: ["purchaseOrderNumbersLookup"],
    queryFn: async () => {
      const response: AxiosResponse<string[]> =
        await getPurchaseOrderNumbers();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetPurchaseOrderListReportDetailsQuery = (
  purchaseOrderNumber: string,
  enabled: boolean,
) => {
  return useQuery<PurchaseOrderListReport, AppError>({
    queryKey: ["purchaseOrderListReportDetails", purchaseOrderNumber],
    queryFn: async () => {
      const response: AxiosResponse<PurchaseOrderListReport> =
        await getPurchaseOrderListReportDetails(purchaseOrderNumber);
      return response.data;
    },
    enabled,
    // A "P/O not found" response is an expected data-state outcome, not a transient
    // network fault - don't burn retries on it (same reasoning as the other reports).
    retry: false,
  });
};

// PDF export is a one-shot side effect, not cached data - modelled as a mutation that
// triggers a browser download from the returned blob.
export const useDownloadPurchaseOrderListReportPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (purchaseOrderNumber) => {
      const response =
        await downloadPurchaseOrderListReportPdf(purchaseOrderNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `PurchaseOrderList_${purchaseOrderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
