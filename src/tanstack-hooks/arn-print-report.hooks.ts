import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getArnPrintDetails,
  downloadArnPrintPdf,
} from "../services/reports/orderwise-inventory/arn-print-report.service";
import type { ArnPrintReportDetails } from "../components/reports/orderwise-inventory/arn/arn-print-report.types";

export const useGetArnPrintDetailsQuery = (arnNumber: string, enabled: boolean) => {
  return useQuery<ArnPrintReportDetails, AppError>({
    queryKey: ["arnPrintReportDetails", arnNumber],
    queryFn: async () => {
      const response: AxiosResponse<ArnPrintReportDetails> = await getArnPrintDetails(arnNumber);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadArnPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (arnNumber) => {
      const response = await downloadArnPrintPdf(arnNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `ARN_${arnNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
