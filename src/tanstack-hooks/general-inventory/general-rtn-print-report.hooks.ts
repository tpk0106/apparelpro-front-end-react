import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getGeneralRtnPrintDetails,
  downloadGeneralRtnPrintPdf,
} from "../../services/reports/general-inventory/general-rtn-print-report.service";
import type { GeneralRtnPrintReportDetails } from "../../components/reports/general-inventory/rtn/general-rtn-print-report.types";

export const useGetGeneralRtnPrintDetailsQuery = (
  rtnNumber: string,
  enabled: boolean,
) => {
  return useQuery<GeneralRtnPrintReportDetails, AppError>({
    queryKey: ["generalRtnPrintReportDetails", rtnNumber],
    queryFn: async () => {
      const response: AxiosResponse<GeneralRtnPrintReportDetails> =
        await getGeneralRtnPrintDetails(rtnNumber);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadGeneralRtnPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (rtnNumber) => {
      const response = await downloadGeneralRtnPrintPdf(rtnNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `General_RTN_${rtnNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
