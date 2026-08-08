import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getColorSizeReportDetails,
  downloadColorSizeReportPdf,
  type ColorSizeReportQueryParams,
} from "../services/reports/order-management/color-size-report.service";
import type { ColorSizeReport } from "../components/reports/order-management/color-size-report/color-size-report.types";

export const useGetColorSizeReportDetailsQuery = (
  params: ColorSizeReportQueryParams,
  enabled: boolean,
) => {
  return useQuery<ColorSizeReport, AppError>({
    queryKey: ["colorSizeReportDetails", params],
    queryFn: async () => {
      const response: AxiosResponse<ColorSizeReport> =
        await getColorSizeReportDetails(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

// PDF export is a one-shot side effect, not cached data - modelled as a mutation that
// triggers a browser download from the returned blob.
export const useDownloadColorSizeReportPdfMutation = () => {
  return useMutation<void, AppError, ColorSizeReportQueryParams>({
    mutationFn: async (params) => {
      const response = await downloadColorSizeReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `ColorSizeReport_${params.order}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
