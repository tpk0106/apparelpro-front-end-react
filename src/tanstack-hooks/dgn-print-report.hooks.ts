import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getDgnPrintDetails,
  downloadDgnPrintPdf,
} from "../services/reports/orderwise-inventory/dgn-print-report.service";
import type { DgnPrintReportDetails } from "../components/reports/orderwise-inventory/dgn/dgn-print-report.types";

export const useGetDgnPrintDetailsQuery = (
  dgnNumber: string,
  enabled: boolean,
) => {
  return useQuery<DgnPrintReportDetails, AppError>({
    queryKey: ["dgnPrintReportDetails", dgnNumber],
    queryFn: async () => {
      const response: AxiosResponse<DgnPrintReportDetails> =
        await getDgnPrintDetails(dgnNumber);
      return response.data;
    },
    enabled,
    // A "DGN No not found" response is an expected user-input outcome (typo, wrong
    // number), not a transient network fault — don't burn retries on it.
    retry: false,
  });
};

// PDF export is a one-shot side effect, not cached data — modelled as a mutation
// that triggers a browser download from the returned blob.
export const useDownloadDgnPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (dgnNumber) => {
      const response = await downloadDgnPrintPdf(dgnNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `DGN_${dgnNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
