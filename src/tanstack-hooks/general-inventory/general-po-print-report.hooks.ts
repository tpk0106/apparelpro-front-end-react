import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getGeneralPoPrintDetails,
  downloadGeneralPoPrintPdf,
} from "../../services/reports/general-inventory/general-po-print-report.service";
import type { GeneralPoPrintReportDetails } from "../../components/reports/general-inventory/po/general-po-print-report.types";

export const useGetGeneralPoPrintDetailsQuery = (
  poNumber: string,
  enabled: boolean,
) => {
  return useQuery<GeneralPoPrintReportDetails, AppError>({
    queryKey: ["generalPoPrintReportDetails", poNumber],
    queryFn: async () => {
      const response: AxiosResponse<GeneralPoPrintReportDetails> =
        await getGeneralPoPrintDetails(poNumber);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadGeneralPoPrintPdfMutation = () => {
  return useMutation<void, AppError, string>({
    mutationFn: async (poNumber) => {
      const response = await downloadGeneralPoPrintPdf(poNumber);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `General_PO_${poNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
