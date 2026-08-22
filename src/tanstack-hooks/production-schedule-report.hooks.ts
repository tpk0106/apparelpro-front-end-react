// TanStack Query hooks for Reports -> A. Production Schedule, PR_MSCHD.PRG.

import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { ProductionScheduleReport } from "../interfaces/production/ProductionScheduleReport";
import {
  loadProductionScheduleReport,
  downloadProductionScheduleReportPdf,
} from "../services/production/production-schedule-report.service";

export const useGetProductionScheduleReport = (fromDate: string | null, toDate: string | null) => {
  return useQuery<ProductionScheduleReport, Error>({
    queryKey: ["productionScheduleReport", fromDate, toDate],
    queryFn: async () => {
      const response: AxiosResponse<ProductionScheduleReport> =
        await loadProductionScheduleReport(fromDate!, toDate!);
      return response.data;
    },
    enabled: !!fromDate && !!toDate,
    retry: false,
  });
};

export const useDownloadProductionScheduleReportPdfMutation = () => {
  return useMutation<void, Error, { fromDate: string; toDate: string }>({
    mutationFn: async ({ fromDate, toDate }) => {
      const response = await downloadProductionScheduleReportPdf(fromDate, toDate);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `ProductionSchedule_${fromDate}_${toDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
