// TanStack Query hooks for Reports -> B. Production Summary (Monthly),
// PR_MPROD.PRG, and its simplified companion variant.

import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { ProductionSummaryMonthlyReport } from "../interfaces/production/ProductionSummaryMonthlyReport";
import type { ProductionSummaryMonthlyOverviewReport } from "../interfaces/production/ProductionSummaryMonthlyOverviewReport";
import {
  loadProductionSummaryMonthlyReport,
  loadProductionSummaryMonthlyOverviewReport,
  downloadProductionSummaryMonthlyReportPdf,
  downloadProductionSummaryMonthlyOverviewReportPdf,
} from "../services/production/production-summary-monthly-report.service";

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

export const useGetProductionSummaryMonthlyReport = (year: number | null, month: number | null) => {
  return useQuery<ProductionSummaryMonthlyReport, Error>({
    queryKey: ["productionSummaryMonthlyReport", year, month],
    queryFn: async () => {
      const response: AxiosResponse<ProductionSummaryMonthlyReport> =
        await loadProductionSummaryMonthlyReport(year!, month!);
      return response.data;
    },
    enabled: !!year && !!month,
    retry: false,
  });
};

export const useDownloadProductionSummaryMonthlyReportPdfMutation = () => {
  return useMutation<void, Error, { year: number; month: number }>({
    mutationFn: async ({ year, month }) => {
      const response = await downloadProductionSummaryMonthlyReportPdf(year, month);
      downloadPdfBlob(response.data, `ProductionSummaryMonthly_${year}_${String(month).padStart(2, "0")}.pdf`);
    },
  });
};

export const useGetProductionSummaryMonthlyOverviewReport = (year: number | null, month: number | null) => {
  return useQuery<ProductionSummaryMonthlyOverviewReport, Error>({
    queryKey: ["productionSummaryMonthlyOverviewReport", year, month],
    queryFn: async () => {
      const response: AxiosResponse<ProductionSummaryMonthlyOverviewReport> =
        await loadProductionSummaryMonthlyOverviewReport(year!, month!);
      return response.data;
    },
    enabled: !!year && !!month,
    retry: false,
  });
};

export const useDownloadProductionSummaryMonthlyOverviewReportPdfMutation = () => {
  return useMutation<void, Error, { year: number; month: number }>({
    mutationFn: async ({ year, month }) => {
      const response = await downloadProductionSummaryMonthlyOverviewReportPdf(year, month);
      downloadPdfBlob(response.data, `ProductionSummaryMonthlyOverview_${year}_${String(month).padStart(2, "0")}.pdf`);
    },
  });
};
