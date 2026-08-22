// TanStack Query hooks for Reports -> H. Employee Efficiency (Daily), PR_EEF1.PRG.

import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { DailyEmployeeEfficiencyReport } from "../interfaces/production/DailyEmployeeEfficiencyReport";
import {
  loadDailyEmployeeEfficiencyReport,
  downloadDailyEmployeeEfficiencyReportPdf,
} from "../services/production/daily-employee-efficiency-report.service";

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

export const useGetDailyEmployeeEfficiencyReport = (date: string | null, lineCode: string | null) => {
  return useQuery<DailyEmployeeEfficiencyReport, Error>({
    queryKey: ["dailyEmployeeEfficiencyReport", date, lineCode],
    queryFn: async () => {
      const response: AxiosResponse<DailyEmployeeEfficiencyReport> =
        await loadDailyEmployeeEfficiencyReport(date!, lineCode);
      return response.data;
    },
    enabled: !!date,
    retry: false,
  });
};

export const useDownloadDailyEmployeeEfficiencyReportPdfMutation = () => {
  return useMutation<void, Error, { date: string; lineCode: string | null }>({
    mutationFn: async ({ date, lineCode }) => {
      const response = await downloadDailyEmployeeEfficiencyReportPdf(date, lineCode);
      downloadPdfBlob(response.data, `DailyEmployeeEfficiency_${date}${lineCode ? `_${lineCode}` : ""}.pdf`);
    },
  });
};
