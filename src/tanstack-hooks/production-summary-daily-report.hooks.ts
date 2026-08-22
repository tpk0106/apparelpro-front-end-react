// TanStack Query hook for Reports -> C. Production Summary (Daily), PR_DPROD.PRG.

import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { ProductionSummaryDailyReport } from "../interfaces/production/ProductionSummaryDailyReport";
import {
  loadProductionSummaryDailyReport,
  downloadProductionSummaryDailyReportPdf,
} from "../services/production/production-summary-daily-report.service";

export const useGetProductionSummaryDailyReport = (date: string | null) => {
  return useQuery<ProductionSummaryDailyReport, Error>({
    queryKey: ["productionSummaryDailyReport", date],
    queryFn: async () => {
      const response: AxiosResponse<ProductionSummaryDailyReport> =
        await loadProductionSummaryDailyReport(date!);
      return response.data;
    },
    enabled: !!date,
    // Backend returns a 422 with a real message ("No entries for given
    // date ...") when nothing was posted that day - that's an expected,
    // user-facing outcome, not something to retry.
    retry: false,
  });
};

// PDF export is a one-shot side effect, not cached data - modelled as a
// mutation that triggers a browser download from the returned blob, same
// pattern as the other reports' PDF export.
export const useDownloadProductionSummaryDailyReportPdfMutation = () => {
  return useMutation<void, Error, string>({
    mutationFn: async (date: string) => {
      const response = await downloadProductionSummaryDailyReportPdf(date);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `ProductionSummaryDaily_${date}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
