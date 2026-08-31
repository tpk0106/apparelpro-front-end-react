import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getGeneralGrnListingReportHeader,
  getGeneralGrnListingReportLines,
  downloadGeneralGrnListingReportPdf,
  type GeneralGrnListingReportParams,
} from "../../services/reports/general-inventory/general-grn-listing-report.service";
import type {
  GeneralGrnListingReportHeader,
  GeneralGrnListingReportLine,
} from "../../interfaces/general-inventory/general-grn-listing-report.types";

export const useGetGeneralGrnListingReportHeaderQuery = (
  params: GeneralGrnListingReportParams,
  enabled: boolean,
) => {
  return useQuery<GeneralGrnListingReportHeader, AppError>({
    queryKey: ["generalGrnListingReportHeader", params],
    queryFn: async () => {
      const response: AxiosResponse<GeneralGrnListingReportHeader> =
        await getGeneralGrnListingReportHeader(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useGetGeneralGrnListingReportLinesQuery = (
  params: GeneralGrnListingReportParams,
  enabled: boolean,
) => {
  return useQuery<GeneralGrnListingReportLine[], AppError>({
    queryKey: ["generalGrnListingReportLines", params],
    queryFn: async () => {
      const response: AxiosResponse<GeneralGrnListingReportLine[]> =
        await getGeneralGrnListingReportLines(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadGeneralGrnListingReportPdfMutation = () => {
  return useMutation<void, AppError, GeneralGrnListingReportParams>({
    mutationFn: async (params) => {
      const response = await downloadGeneralGrnListingReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `General_GRN_Listing_${params.fromDate}_${params.toDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
