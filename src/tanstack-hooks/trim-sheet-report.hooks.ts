import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getTrimSheetReportDetails,
  downloadTrimSheetReportPdf,
  type TrimSheetReportQueryParams,
} from "../services/trim-sheet-report.service";
import type { TrimSheetReportDetails } from "../components/trim-sheet-report/trim-sheet-report.types";

export const useGetTrimSheetReportDetailsQuery = (
  params: TrimSheetReportQueryParams,
  enabled: boolean,
) => {
  return useQuery<TrimSheetReportDetails, AppError>({
    queryKey: ["trimSheetReportDetails", params],
    queryFn: async () => {
      const response: AxiosResponse<TrimSheetReportDetails> =
        await getTrimSheetReportDetails(params);
      return response.data;
    },
    enabled,
    // A "style/order not found" or "no currency rate on file" response is an expected
    // data-state outcome, not a transient network fault - don't burn retries on it.
    retry: false,
  });
};

// PDF export is a one-shot side effect, not cached data - modelled as a mutation that
// triggers a browser download from the returned blob.
export const useDownloadTrimSheetReportPdfMutation = () => {
  return useMutation<void, AppError, TrimSheetReportQueryParams>({
    mutationFn: async (params) => {
      const response = await downloadTrimSheetReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `TrimSheet_${params.styleCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
