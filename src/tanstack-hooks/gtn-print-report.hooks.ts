import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getGtnPrintDetails,
  downloadGtnPrintPdf,
} from "../services/reports/orderwise-inventory/gtn-print-report.service";
import type { GtnPrintReportDetails } from "../components/reports/orderwise-inventory/gtn/gtn-print-report.types";

export const useGetGtnPrintDetailsQuery = (
  gtnNumber: string,
  enabled: boolean,
) => {
  return useQuery<GtnPrintReportDetails, AppError>({
    queryKey: ["gtnPrintReportDetails", gtnNumber],
    queryFn: async () => {
      const response: AxiosResponse<GtnPrintReportDetails> =
        await getGtnPrintDetails(gtnNumber);
      return response.data;
    },
    enabled,
    // A "GTN No not found" response is an expected user-input outcome (typo, wrong
    // number), not a transient network fault — don't burn retries on it.
    retry: false,
  });
};

// PDF export is a one-shot side effect, not cached data — modelled as a mutation
// that triggers a browser download from the returned blob.
export const useDownloadGtnPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (gtnNumber) => {
      const response = await downloadGtnPrintPdf(gtnNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `GTN_${gtnNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
