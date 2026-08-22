// TanStack Query hooks for Reports -> D. Production Summary (Style Wise),
// PR_MPRO1.PRG, and its per-line Detailed companion variant.

import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type {
  ProductionSummaryStyleWiseReport,
  ProductionSummaryStyleWiseDetailedReport,
} from "../interfaces/production/ProductionSummaryStyleWiseReport";
import {
  loadProductionSummaryStyleWiseReport,
  loadProductionSummaryStyleWiseDetailedReport,
  downloadProductionSummaryStyleWiseReportPdf,
  downloadProductionSummaryStyleWiseDetailedReportPdf,
} from "../services/production/production-summary-style-wise-report.service";

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

type DateRange = { startDate: string; endDate: string };

const pdfFileName = (prefix: string, { startDate, endDate }: DateRange) => `${prefix}_${startDate}_to_${endDate}.pdf`;

export const useGetProductionSummaryStyleWiseReport = (startDate: string | null, endDate: string | null) => {
  return useQuery<ProductionSummaryStyleWiseReport, Error>({
    queryKey: ["productionSummaryStyleWiseReport", startDate, endDate],
    queryFn: async () => {
      const response: AxiosResponse<ProductionSummaryStyleWiseReport> =
        await loadProductionSummaryStyleWiseReport(startDate!, endDate!);
      return response.data;
    },
    enabled: !!startDate && !!endDate,
    retry: false,
  });
};

export const useDownloadProductionSummaryStyleWiseReportPdfMutation = () => {
  return useMutation<void, Error, DateRange>({
    mutationFn: async (range) => {
      const response = await downloadProductionSummaryStyleWiseReportPdf(range.startDate, range.endDate);
      downloadPdfBlob(response.data, pdfFileName("ProductionSummaryStyleWise", range));
    },
  });
};

export const useGetProductionSummaryStyleWiseDetailedReport = (startDate: string | null, endDate: string | null) => {
  return useQuery<ProductionSummaryStyleWiseDetailedReport, Error>({
    queryKey: ["productionSummaryStyleWiseDetailedReport", startDate, endDate],
    queryFn: async () => {
      const response: AxiosResponse<ProductionSummaryStyleWiseDetailedReport> =
        await loadProductionSummaryStyleWiseDetailedReport(startDate!, endDate!);
      return response.data;
    },
    enabled: !!startDate && !!endDate,
    retry: false,
  });
};

export const useDownloadProductionSummaryStyleWiseDetailedReportPdfMutation = () => {
  return useMutation<void, Error, DateRange>({
    mutationFn: async (range) => {
      const response = await downloadProductionSummaryStyleWiseDetailedReportPdf(range.startDate, range.endDate);
      downloadPdfBlob(response.data, pdfFileName("ProductionSummaryStyleWiseDetailed", range));
    },
  });
};
