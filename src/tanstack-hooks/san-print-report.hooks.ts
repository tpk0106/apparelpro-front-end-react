import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getSanPrintDetails,
  downloadSanPrintPdf,
} from "../services/reports/orderwise-inventory/san-print-report.service";
import type { SanPrintReportDetails } from "../components/reports/orderwise-inventory/san/san-print-report.types";

export const useGetSanPrintDetailsQuery = (
  sanNumber: string,
  enabled: boolean,
) => {
  return useQuery<SanPrintReportDetails, AppError>({
    queryKey: ["sanPrintReportDetails", sanNumber],
    queryFn: async () => {
      const response: AxiosResponse<SanPrintReportDetails> =
        await getSanPrintDetails(sanNumber);
      return response.data;
    },
    enabled,
    // A "SAN No not found" response is an expected user-input outcome (typo, wrong
    // number), not a transient network fault — don't burn retries on it.
    retry: false,
  });
};

// PDF export is a one-shot side effect, not cached data — modelled as a mutation
// that triggers a browser download from the returned blob.
export const useDownloadSanPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (sanNumber) => {
      const response = await downloadSanPrintPdf(sanNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `SAN_${sanNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
