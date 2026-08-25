import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getGeneralGtnPrintDetails,
  downloadGeneralGtnPrintPdf,
} from "../../services/reports/general-inventory/general-gtn-print-report.service";
import type { GeneralGtnPrintReportDetails } from "../../components/reports/general-inventory/gtn/general-gtn-print-report.types";

export const useGetGeneralGtnPrintDetailsQuery = (
  gtnNumber: string,
  enabled: boolean,
) => {
  return useQuery<GeneralGtnPrintReportDetails, AppError>({
    queryKey: ["generalGtnPrintReportDetails", gtnNumber],
    queryFn: async () => {
      const response: AxiosResponse<GeneralGtnPrintReportDetails> =
        await getGeneralGtnPrintDetails(gtnNumber);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadGeneralGtnPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (gtnNumber) => {
      const response = await downloadGeneralGtnPrintPdf(gtnNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `General_GTN_${gtnNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
