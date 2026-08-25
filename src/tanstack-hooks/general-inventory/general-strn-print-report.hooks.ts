import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getGeneralStrnPrintDetails,
  downloadGeneralStrnPrintPdf,
} from "../../services/reports/general-inventory/general-strn-print-report.service";
import type { GeneralStrnPrintReportDetails } from "../../components/reports/general-inventory/strn/general-strn-print-report.types";

export const useGetGeneralStrnPrintDetailsQuery = (
  srnNumber: string,
  enabled: boolean,
) => {
  return useQuery<GeneralStrnPrintReportDetails, AppError>({
    queryKey: ["generalStrnPrintReportDetails", srnNumber],
    queryFn: async () => {
      const response: AxiosResponse<GeneralStrnPrintReportDetails> =
        await getGeneralStrnPrintDetails(srnNumber);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadGeneralStrnPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (srnNumber) => {
      const response = await downloadGeneralStrnPrintPdf(srnNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `General_SRN_${srnNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
