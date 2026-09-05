import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getGrnPrintDetails,
  downloadGrnPrintPdf,
} from "../services/reports/orderwise-inventory/grn-print-report.service";
import type { GrnPrintReportDetails } from "../components/reports/orderwise-inventory/grn/grn-print-report.types";

export const useGetGrnPrintDetailsQuery = (
  grnNumber: string,
  enabled: boolean,
) => {
  return useQuery<GrnPrintReportDetails, AppError>({
    queryKey: ["grnPrintReportDetails", grnNumber],
    queryFn: async () => {
      const response: AxiosResponse<GrnPrintReportDetails> =
        await getGrnPrintDetails(grnNumber);
      return response.data;
    },
    enabled,
    // A "GRN No not found" response is an expected user-input outcome (typo, wrong
    // number), not a transient network fault — don't burn retries on it.
    retry: false,
  });
};

// PDF export is a one-shot side effect, not cached data — modelled as a mutation
// that triggers a browser download from the returned blob.
export const useDownloadGrnPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (grnNumber) => {
      const response = await downloadGrnPrintPdf(grnNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `GRN_${grnNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
