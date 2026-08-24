import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getPendingEventsReportDetails,
  downloadPendingEventsReportPdf,
  type PendingEventsReportQueryParams,
} from "../services/reports/order-management/pending-events-report.service";
import type { PendingEventsReport } from "../components/reports/order-management/pending-events-report/pending-events-report.types";

export const useGetPendingEventsReportDetailsQuery = (
  params: PendingEventsReportQueryParams,
  enabled: boolean,
) => {
  return useQuery<PendingEventsReport, AppError>({
    queryKey: ["pendingEventsReportDetails", params],
    queryFn: async () => {
      const response: AxiosResponse<PendingEventsReport> =
        await getPendingEventsReportDetails(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadPendingEventsReportPdfMutation = () => {
  return useMutation<void, AppError, PendingEventsReportQueryParams>({
    mutationFn: async (params) => {
      const response = await downloadPendingEventsReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "PendingEventsReport.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
