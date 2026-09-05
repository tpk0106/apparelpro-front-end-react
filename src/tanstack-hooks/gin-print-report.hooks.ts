import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getGinPrintDetails,
  downloadGinPrintPdf,
} from "../services/reports/orderwise-inventory/gin-print-report.service";
import type { GinPrintReportDetails } from "../components/reports/orderwise-inventory/gin/gin-print-report.types";

export const useGetGinPrintDetailsQuery = (
  ginNumber: string,
  enabled: boolean,
) => {
  return useQuery<GinPrintReportDetails, AppError>({
    queryKey: ["ginPrintReportDetails", ginNumber],
    queryFn: async () => {
      const response: AxiosResponse<GinPrintReportDetails> =
        await getGinPrintDetails(ginNumber);
      return response.data;
    },
    enabled,
    // A "GIN No not found" response is an expected user-input outcome (typo, wrong
    // number), not a transient network fault — don't burn retries on it.
    retry: false,
  });
};

// PDF export is a one-shot side effect, not cached data — modelled as a mutation
// that triggers a browser download from the returned blob.
export const useDownloadGinPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (ginNumber) => {
      const response = await downloadGinPrintPdf(ginNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `GIN_${ginNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
