import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getGeneralGrnPrintDetails,
  downloadGeneralGrnPrintPdf,
} from "../../services/reports/general-inventory/general-grn-print-report.service";
import type { GeneralGrnPrintReportDetails } from "../../components/reports/general-inventory/grn/general-grn-print-report.types";

export const useGetGeneralGrnPrintDetailsQuery = (
  grnNumber: string,
  enabled: boolean,
) => {
  return useQuery<GeneralGrnPrintReportDetails, AppError>({
    queryKey: ["generalGrnPrintReportDetails", grnNumber],
    queryFn: async () => {
      const response: AxiosResponse<GeneralGrnPrintReportDetails> =
        await getGeneralGrnPrintDetails(grnNumber);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadGeneralGrnPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (grnNumber) => {
      const response = await downloadGeneralGrnPrintPdf(grnNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `General_GRN_${grnNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
