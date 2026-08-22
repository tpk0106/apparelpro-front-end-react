// TanStack Query hooks for Reports -> J. Production Line Efficiency, PR_GRH1.PRG.

import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { LineEfficiencyReport } from "../interfaces/production/LineEfficiencyReport";
import {
  loadLineEfficiencyReport,
  downloadLineEfficiencyReportPdf,
} from "../services/production/line-efficiency-report.service";

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

type LineMonthScope = { lineCode: string; year: number; month: number };

export const useGetLineEfficiencyReport = (scope: LineMonthScope | null) => {
  return useQuery<LineEfficiencyReport, Error>({
    queryKey: ["lineEfficiencyReport", scope?.lineCode, scope?.year, scope?.month],
    queryFn: async () => {
      const response: AxiosResponse<LineEfficiencyReport> =
        await loadLineEfficiencyReport(scope!.lineCode, scope!.year, scope!.month);
      return response.data;
    },
    enabled: !!scope,
    retry: false,
  });
};

export const useDownloadLineEfficiencyReportPdfMutation = () => {
  return useMutation<void, Error, LineMonthScope>({
    mutationFn: async (scope) => {
      const response = await downloadLineEfficiencyReportPdf(scope.lineCode, scope.year, scope.month);
      downloadPdfBlob(response.data, `LineEfficiency_${scope.lineCode}_${scope.year}_${String(scope.month).padStart(2, "0")}.pdf`);
    },
  });
};
