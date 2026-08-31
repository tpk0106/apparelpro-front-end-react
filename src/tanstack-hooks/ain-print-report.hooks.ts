import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getAinPrintDetails,
  downloadAinPrintPdf,
} from "../services/reports/orderwise-inventory/ain-print-report.service";
import type { AinPrintReportDetails } from "../components/reports/orderwise-inventory/ain/ain-print-report.types";

export const useGetAinPrintDetailsQuery = (ainNumber: string, enabled: boolean) => {
  return useQuery<AinPrintReportDetails, AppError>({
    queryKey: ["ainPrintReportDetails", ainNumber],
    queryFn: async () => {
      const response: AxiosResponse<AinPrintReportDetails> = await getAinPrintDetails(ainNumber);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadAinPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (ainNumber) => {
      const response = await downloadAinPrintPdf(ainNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `AIN_${ainNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
