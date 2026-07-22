import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getStrnPrintDetails,
  downloadStrnPrintPdf,
} from "../services/strn-print-report.service";
import type { StrnPrintReportDetails } from "../components/reports-orderwise-inventory/strn-print-report.types";

export const useGetStrnPrintDetailsQuery = (
  strnNumber: string,
  enabled: boolean,
) => {
  return useQuery<StrnPrintReportDetails, AppError>({
    queryKey: ["strnPrintReportDetails", strnNumber],
    queryFn: async () => {
      const response: AxiosResponse<StrnPrintReportDetails> =
        await getStrnPrintDetails(strnNumber);
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
export const useDownloadStrnPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (strnNumber) => {
      const response = await downloadStrnPrintPdf(strnNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `STRN_${strnNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
