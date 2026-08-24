import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getYearSeasonOrdersReportDetails,
  downloadYearSeasonOrdersReportPdf,
  type YearSeasonOrdersReportQueryParams,
} from "../services/reports/order-management/year-season-orders-report.service";
import type { YearSeasonOrdersReport } from "../components/reports/order-management/year-season-orders-report/year-season-orders-report.types";

export const useGetYearSeasonOrdersReportDetailsQuery = (
  params: YearSeasonOrdersReportQueryParams,
  enabled: boolean,
) => {
  return useQuery<YearSeasonOrdersReport, AppError>({
    queryKey: ["yearSeasonOrdersReportDetails", params],
    queryFn: async () => {
      const response: AxiosResponse<YearSeasonOrdersReport> =
        await getYearSeasonOrdersReportDetails(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadYearSeasonOrdersReportPdfMutation = () => {
  return useMutation<void, AppError, YearSeasonOrdersReportQueryParams>({
    mutationFn: async (params) => {
      const response = await downloadYearSeasonOrdersReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "YearSeasonOrdersReport.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
