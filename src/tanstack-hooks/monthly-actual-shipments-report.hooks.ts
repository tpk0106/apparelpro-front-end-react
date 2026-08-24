import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getMonthlyActualShipmentsReportDetails,
  downloadMonthlyActualShipmentsReportPdf,
  type MonthlyActualShipmentsReportQueryParams,
} from "../services/reports/order-management/monthly-actual-shipments-report.service";
import type { MonthlyActualShipmentsReport } from "../components/reports/order-management/monthly-actual-shipments-report/monthly-actual-shipments-report.types";

export const useGetMonthlyActualShipmentsReportDetailsQuery = (
  params: MonthlyActualShipmentsReportQueryParams | null,
  enabled: boolean,
) => {
  return useQuery<MonthlyActualShipmentsReport, AppError>({
    queryKey: ["monthlyActualShipmentsReportDetails", params],
    queryFn: async () => {
      const response: AxiosResponse<MonthlyActualShipmentsReport> =
        await getMonthlyActualShipmentsReportDetails(params as MonthlyActualShipmentsReportQueryParams);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadMonthlyActualShipmentsReportPdfMutation = () => {
  return useMutation<void, AppError, MonthlyActualShipmentsReportQueryParams>({
    mutationFn: async (params) => {
      const response = await downloadMonthlyActualShipmentsReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "MonthlyActualShipmentsReport.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
