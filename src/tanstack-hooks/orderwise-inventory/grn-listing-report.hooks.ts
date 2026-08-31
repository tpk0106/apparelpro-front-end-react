import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../../auth/axiosClient";
import {
  getGrnListingReportHeader,
  getGrnListingReportLines,
  downloadGrnListingReportPdf,
  type GrnListingReportParams,
} from "../../services/reports/orderwise-inventory/grn-listing-report.service";
import type {
  GrnListingReportHeader,
  GrnListingReportLine,
} from "../../interfaces/orderwise-inventory/grn-listing-report.types";

export const useGetGrnListingReportHeaderQuery = (params: GrnListingReportParams, enabled: boolean) => {
  return useQuery<GrnListingReportHeader, AppError>({
    queryKey: ["orderwiseGrnListingReportHeader", params],
    queryFn: async () => {
      const response: AxiosResponse<GrnListingReportHeader> = await getGrnListingReportHeader(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useGetGrnListingReportLinesQuery = (params: GrnListingReportParams, enabled: boolean) => {
  return useQuery<GrnListingReportLine[], AppError>({
    queryKey: ["orderwiseGrnListingReportLines", params],
    queryFn: async () => {
      const response: AxiosResponse<GrnListingReportLine[]> = await getGrnListingReportLines(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadGrnListingReportPdfMutation = () => {
  return useMutation<void, AppError, GrnListingReportParams>({
    mutationFn: async (params) => {
      const response = await downloadGrnListingReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Orderwise_GRN_Listing_${params.fromDate ?? params.buyerCode}_${params.toDate ?? params.order}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
