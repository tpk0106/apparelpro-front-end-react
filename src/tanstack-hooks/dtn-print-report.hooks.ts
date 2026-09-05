import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getDtnPrintDetails,
  downloadDtnPrintPdf,
} from "../services/reports/orderwise-inventory/dtn-print-report.service";
import type { DtnPrintReportDetails } from "../components/reports/orderwise-inventory/dtn/dtn-print-report.types";

export const useGetDtnPrintDetailsQuery = (
  dtnNumber: string,
  enabled: boolean,
) => {
  return useQuery<DtnPrintReportDetails, AppError>({
    queryKey: ["dtnPrintReportDetails", dtnNumber],
    queryFn: async () => {
      const response: AxiosResponse<DtnPrintReportDetails> =
        await getDtnPrintDetails(dtnNumber);
      return response.data;
    },
    enabled,
    // A "DTN No not found" response is an expected user-input outcome (typo, wrong
    // number), not a transient network fault — don't burn retries on it.
    retry: false,
  });
};

// PDF export is a one-shot side effect, not cached data — modelled as a mutation
// that triggers a browser download from the returned blob.
export const useDownloadDtnPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (dtnNumber) => {
      const response = await downloadDtnPrintPdf(dtnNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `DTN_${dtnNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
