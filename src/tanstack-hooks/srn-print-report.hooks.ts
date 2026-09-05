import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getSrnPrintDetails,
  downloadSrnPrintPdf,
} from "../services/reports/orderwise-inventory/srn-print-report.service";
import type { SrnPrintReportDetails } from "../components/reports/orderwise-inventory/srn/srn-print-report.types";

export const useGetSrnPrintDetailsQuery = (
  srnNumber: string,
  enabled: boolean,
) => {
  return useQuery<SrnPrintReportDetails, AppError>({
    queryKey: ["srnPrintReportDetails", srnNumber],
    queryFn: async () => {
      const response: AxiosResponse<SrnPrintReportDetails> =
        await getSrnPrintDetails(srnNumber);
      return response.data;
    },
    enabled,
    // A "SRN No not found" response is an expected user-input outcome (typo, wrong
    // number), not a transient network fault — don't burn retries on it.
    retry: false,
  });
};

// PDF export is a one-shot side effect, not cached data — modelled as a mutation
// that triggers a browser download from the returned blob.
export const useDownloadSrnPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (srnNumber) => {
      const response = await downloadSrnPrintPdf(srnNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `SRN_${srnNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
