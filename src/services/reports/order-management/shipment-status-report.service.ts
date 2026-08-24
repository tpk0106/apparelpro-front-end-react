import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { ShipmentStatusReport } from "../../../components/reports/order-management/shipment-status-report/shipment-status-report.types";

interface ShipmentStatusReportQueryParams {
  buyerCode: number;
  order: string;
}

const getShipmentStatusReportDetails = async (
  params: ShipmentStatusReportQueryParams,
) => {
  return await client.get<ShipmentStatusReport>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.SHIPMENT_STATUS_REPORT.GET_DETAILS,
    { params },
  );
};

const downloadShipmentStatusReportPdf = async (
  params: ShipmentStatusReportQueryParams,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.SHIPMENT_STATUS_REPORT.GET_PDF,
    { params, responseType: "blob" },
  );
};

export { getShipmentStatusReportDetails, downloadShipmentStatusReportPdf };
export type { ShipmentStatusReportQueryParams };
