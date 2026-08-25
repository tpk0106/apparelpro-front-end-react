import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getGeneralDgnPrintDetails,
  downloadGeneralDgnPrintPdf,
} from "../../services/reports/general-inventory/general-dgn-print-report.service";
import type { GeneralDgnPrintReportDetails } from "../../components/reports/general-inventory/dgn/general-dgn-print-report.types";

export const useGetGeneralDgnPrintDetailsQuery = (
  dgnNumber: string,
  enabled: boolean,
) => {
  return useQuery<GeneralDgnPrintReportDetails, AppError>({
    queryKey: ["generalDgnPrintReportDetails", dgnNumber],
    queryFn: async () => {
      const response: AxiosResponse<GeneralDgnPrintReportDetails> =
        await getGeneralDgnPrintDetails(dgnNumber);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadGeneralDgnPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (dgnNumber) => {
      const response = await downloadGeneralDgnPrintPdf(dgnNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `General_DGN_${dgnNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
