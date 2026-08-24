import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getPostOrderCostSheetReportDetails,
  downloadPostOrderCostSheetReportPdf,
  type PostOrderCostSheetReportQueryParams,
} from "../services/reports/order-management/post-order-cost-sheet-report.service";
import type { PostOrderCostSheetReport } from "../components/reports/order-management/post-order-cost-sheet-report/post-order-cost-sheet-report.types";

export const useGetPostOrderCostSheetReportDetailsQuery = (
  params: PostOrderCostSheetReportQueryParams | null,
  enabled: boolean,
) => {
  return useQuery<PostOrderCostSheetReport, AppError>({
    queryKey: ["postOrderCostSheetReportDetails", params],
    queryFn: async () => {
      const response: AxiosResponse<PostOrderCostSheetReport> =
        await getPostOrderCostSheetReportDetails(params as PostOrderCostSheetReportQueryParams);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadPostOrderCostSheetReportPdfMutation = () => {
  return useMutation<void, AppError, PostOrderCostSheetReportQueryParams>({
    mutationFn: async (params) => {
      const response = await downloadPostOrderCostSheetReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "PostOrderCostSheetReport.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
