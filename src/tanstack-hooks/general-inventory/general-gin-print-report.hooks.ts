import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getGeneralGinPrintDetails,
  downloadGeneralGinPrintPdf,
} from "../../services/reports/general-inventory/general-gin-print-report.service";
import type { GeneralGinPrintReportDetails } from "../../components/reports/general-inventory/gin/general-gin-print-report.types";

export const useGetGeneralGinPrintDetailsQuery = (
  ginNumber: string,
  enabled: boolean,
) => {
  return useQuery<GeneralGinPrintReportDetails, AppError>({
    queryKey: ["generalGinPrintReportDetails", ginNumber],
    queryFn: async () => {
      const response: AxiosResponse<GeneralGinPrintReportDetails> =
        await getGeneralGinPrintDetails(ginNumber);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadGeneralGinPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (ginNumber) => {
      const response = await downloadGeneralGinPrintPdf(ginNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `General_GIN_${ginNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
