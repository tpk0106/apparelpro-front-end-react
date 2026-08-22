// TanStack Query hooks for Reports -> K. Estimated Production Schedule, PR_ESTL2.PRG.

import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { EstimatedProductionScheduleReport } from "../interfaces/production/EstimatedProductionScheduleReport";
import {
  loadEstimatedProductionScheduleReport,
  downloadEstimatedProductionScheduleReportPdf,
} from "../services/production/estimated-production-schedule-report.service";

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

export const useGetEstimatedProductionScheduleReport = (fromDate: string, toDate: string) => {
  return useQuery<EstimatedProductionScheduleReport, Error>({
    queryKey: ["estimatedProductionScheduleReport", fromDate, toDate],
    queryFn: async () => {
      const response: AxiosResponse<EstimatedProductionScheduleReport> =
        await loadEstimatedProductionScheduleReport(fromDate, toDate);
      return response.data;
    },
    enabled: !!fromDate && !!toDate,
    retry: false,
  });
};

export const useDownloadEstimatedProductionScheduleReportPdfMutation = () => {
  return useMutation<void, Error, { fromDate: string; toDate: string }>({
    mutationFn: async ({ fromDate, toDate }) => {
      const response = await downloadEstimatedProductionScheduleReportPdf(fromDate, toDate);
      downloadPdfBlob(response.data, `EstimatedProductionSchedule_${fromDate}_to_${toDate}.pdf`);
    },
  });
};
