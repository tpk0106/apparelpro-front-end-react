import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { ScheduledShipmentsReport } from "../../../components/reports/order-management/scheduled-shipments-report/scheduled-shipments-report.types";

interface ScheduledShipmentsReportQueryParams {
  buyerCode?: number;
  order?: string;
}

const getScheduledShipmentsReportDetails = async (
  params: ScheduledShipmentsReportQueryParams,
) => {
  return await client.get<ScheduledShipmentsReport>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.SCHEDULED_SHIPMENTS_REPORT.GET_DETAILS,
    { params },
  );
};

const downloadScheduledShipmentsReportPdf = async (
  params: ScheduledShipmentsReportQueryParams,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.SCHEDULED_SHIPMENTS_REPORT.GET_PDF,
    { params, responseType: "blob" },
  );
};

export { getScheduledShipmentsReportDetails, downloadScheduledShipmentsReportPdf };
export type { ScheduledShipmentsReportQueryParams };
