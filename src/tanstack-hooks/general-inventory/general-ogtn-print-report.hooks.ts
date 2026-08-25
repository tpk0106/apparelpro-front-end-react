import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getOrderGtnPrintDetails,
  downloadOrderGtnPrintPdf,
} from "../../services/reports/general-inventory/general-ogtn-print-report.service";
import type { OrderGtnPrintReportDetails } from "../../components/reports/general-inventory/ogtn/general-ogtn-print-report.types";

export const useGetOrderGtnPrintDetailsQuery = (
  ogtnNumber: string,
  enabled: boolean,
) => {
  return useQuery<OrderGtnPrintReportDetails, AppError>({
    queryKey: ["orderGtnPrintReportDetails", ogtnNumber],
    queryFn: async () => {
      const response: AxiosResponse<OrderGtnPrintReportDetails> =
        await getOrderGtnPrintDetails(ogtnNumber);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadOrderGtnPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (ogtnNumber) => {
      const response = await downloadOrderGtnPrintPdf(ogtnNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `General_OGTN_${ogtnNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
