// TanStack Query hooks for Reports -> I. Employee Efficiency (Monthly), PR_REP4.PRG.

import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { MonthlyEmployeeEfficiencyReport } from "../interfaces/production/MonthlyEmployeeEfficiencyReport";
import {
  loadMonthlyEmployeeEfficiencyReport,
  downloadMonthlyEmployeeEfficiencyReportPdf,
} from "../services/production/monthly-employee-efficiency-report.service";

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

export const useGetMonthlyEmployeeEfficiencyReport = (year: number | null, month: number | null) => {
  return useQuery<MonthlyEmployeeEfficiencyReport, Error>({
    queryKey: ["monthlyEmployeeEfficiencyReport", year, month],
    queryFn: async () => {
      const response: AxiosResponse<MonthlyEmployeeEfficiencyReport> =
        await loadMonthlyEmployeeEfficiencyReport(year!, month!);
      return response.data;
    },
    enabled: !!year && !!month,
    retry: false,
  });
};

export const useDownloadMonthlyEmployeeEfficiencyReportPdfMutation = () => {
  return useMutation<void, Error, { year: number; month: number }>({
    mutationFn: async ({ year, month }) => {
      const response = await downloadMonthlyEmployeeEfficiencyReportPdf(year, month);
      downloadPdfBlob(response.data, `MonthlyEmployeeEfficiency_${year}_${String(month).padStart(2, "0")}.pdf`);
    },
  });
};
