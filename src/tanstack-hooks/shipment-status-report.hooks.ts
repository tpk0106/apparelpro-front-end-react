import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { AppError } from "../auth/axiosClient";
import {
  getShipmentStatusReportDetails,
  downloadShipmentStatusReportPdf,
  type ShipmentStatusReportQueryParams,
} from "../services/reports/order-management/shipment-status-report.service";
import type { ShipmentStatusReport } from "../components/reports/order-management/shipment-status-report/shipment-status-report.types";

export const useGetShipmentStatusReportDetailsQuery = (
  params: ShipmentStatusReportQueryParams,
  enabled: boolean,
) => {
  return useQuery<ShipmentStatusReport, AppError>({
    queryKey: ["shipmentStatusReportDetails", params],
    queryFn: async () => {
      const response: AxiosResponse<ShipmentStatusReport> =
        await getShipmentStatusReportDetails(params);
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useDownloadShipmentStatusReportPdfMutation = () => {
  return useMutation<void, AppError, ShipmentStatusReportQueryParams>({
    mutationFn: async (params) => {
      const response = await downloadShipmentStatusReportPdf(params);
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "ShipmentStatusReport.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    },
  });
};
