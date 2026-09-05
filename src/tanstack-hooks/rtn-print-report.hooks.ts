import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getRtnPrintDetails,
  downloadRtnPrintPdf,
} from "../services/reports/orderwise-inventory/rtn-print-report.service";
import type { RtnPrintReportDetails } from "../components/reports/orderwise-inventory/rtn/rtn-print-report.types";

export const useGetRtnPrintDetailsQuery = (
  rtnNumber: string,
  enabled: boolean,
) => {
  return useQuery<RtnPrintReportDetails, AppError>({
    queryKey: ["rtnPrintReportDetails", rtnNumber],
    queryFn: async () => {
      const response: AxiosResponse<RtnPrintReportDetails> =
        await getRtnPrintDetails(rtnNumber);
      return response.data;
    },
    enabled,
    // A "RTN No not found" response is an expected user-input outcome (typo, wrong
    // number), not a transient network fault — don't burn retries on it.
    retry: false,
  });
};

// PDF export is a one-shot side effect, not cached data — modelled as a mutation
// that triggers a browser download from the returned blob.
export const useDownloadRtnPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (rtnNumber) => {
      const response = await downloadRtnPrintPdf(rtnNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `RTN_${rtnNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
