import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getScheduledShipmentsReportDetails,
  downloadScheduledShipmentsReportPdf,
  type ScheduledShipmentsReportQueryParams,
} from "../services/reports/order-management/scheduled-shipments-report.service";
import type { ScheduledShipmentsReport } from "../components/reports/order-management/scheduled-shipments-report/scheduled-shipments-report.types";

export const useGetScheduledShipmentsReportDetailsQuery = (
  params: ScheduledShipmentsReportQueryParams,
  enabled: boolean,
) => {
  return useQuery<ScheduledShipmentsReport, AppError>({
    queryKey: ["scheduledShipmentsReportDetails", params],
    queryFn: async () => {
      const response: AxiosResponse<ScheduledShipmentsReport> =
        await getScheduledShipmentsReportDetails(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadScheduledShipmentsReportPdfMutation = () => {
  return useMutation<void, AppError, ScheduledShipmentsReportQueryParams>({
    mutationFn: async (params) => {
      const response = await downloadScheduledShipmentsReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "ScheduledShipmentsReport.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
