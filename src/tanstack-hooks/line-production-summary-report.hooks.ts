// TanStack Query hooks for Reports -> E. Line Production Summary, PR_LPROD.PRG.

import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { LineProductionSummaryReport } from "../interfaces/production/LineProductionSummaryReport";
import {
  loadLineProductionSummaryReport,
  downloadLineProductionSummaryReportPdf,
} from "../services/production/line-production-summary-report.service";

const downloadPdfBlob = (blob: Blob, fileName: string) => {
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const useGetLineProductionSummaryReport = (startDate: string | null, endDate: string | null) => {
  return useQuery<LineProductionSummaryReport, Error>({
    queryKey: ["lineProductionSummaryReport", startDate, endDate],
    queryFn: async () => {
      const response: AxiosResponse<LineProductionSummaryReport> =
        await loadLineProductionSummaryReport(startDate!, endDate!);
      return response.data;
    },
    enabled: !!startDate && !!endDate,
    retry: false,
  });
};

export const useDownloadLineProductionSummaryReportPdfMutation = () => {
  return useMutation<void, Error, { startDate: string; endDate: string }>({
    mutationFn: async ({ startDate, endDate }) => {
      const response = await downloadLineProductionSummaryReportPdf(startDate, endDate);
      downloadPdfBlob(response.data, `LineProductionSummary_${startDate}_to_${endDate}.pdf`);
    },
  });
};
