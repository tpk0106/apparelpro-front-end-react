import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getCostOfProductionReportDetails,
  downloadCostOfProductionReportPdf,
  type CostOfProductionReportQueryParams,
} from "../services/reports/order-management/cost-of-production-report.service";
import type { CostOfProductionReport } from "../components/reports/order-management/cost-of-production-report/cost-of-production-report.types";

export const useGetCostOfProductionReportDetailsQuery = (
  params: CostOfProductionReportQueryParams,
  enabled: boolean,
) => {
  return useQuery<CostOfProductionReport, AppError>({
    queryKey: ["costOfProductionReportDetails", params],
    queryFn: async () => {
      const response: AxiosResponse<CostOfProductionReport> =
        await getCostOfProductionReportDetails(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadCostOfProductionReportPdfMutation = () => {
  return useMutation<void, AppError, CostOfProductionReportQueryParams>({
    mutationFn: async (params) => {
      const response = await downloadCostOfProductionReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "CostOfProductionReport.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
