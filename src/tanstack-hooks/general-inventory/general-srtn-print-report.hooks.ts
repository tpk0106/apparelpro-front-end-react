import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getGeneralSrtnPrintDetails,
  downloadGeneralSrtnPrintPdf,
} from "../../services/reports/general-inventory/general-srtn-print-report.service";
import type { GeneralSrtnPrintReportDetails } from "../../components/reports/general-inventory/srtn/general-srtn-print-report.types";

export const useGetGeneralSrtnPrintDetailsQuery = (
  srtnNumber: string,
  enabled: boolean,
) => {
  return useQuery<GeneralSrtnPrintReportDetails, AppError>({
    queryKey: ["generalSrtnPrintReportDetails", srtnNumber],
    queryFn: async () => {
      const response: AxiosResponse<GeneralSrtnPrintReportDetails> =
        await getGeneralSrtnPrintDetails(srtnNumber);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadGeneralSrtnPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (srtnNumber) => {
      const response = await downloadGeneralSrtnPrintPdf(srtnNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `General_SRTN_${srtnNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
