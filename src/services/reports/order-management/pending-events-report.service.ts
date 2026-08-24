import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { PendingEventsReport } from "../../../components/reports/order-management/pending-events-report/pending-events-report.types";

interface PendingEventsReportQueryParams {
  asOfDate: string;
}

const getPendingEventsReportDetails = async (
  params: PendingEventsReportQueryParams,
) => {
  return await client.get<PendingEventsReport>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.PENDING_EVENTS_REPORT.GET_DETAILS,
    { params },
  );
};

const downloadPendingEventsReportPdf = async (
  params: PendingEventsReportQueryParams,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.PENDING_EVENTS_REPORT.GET_PDF,
    { params, responseType: "blob" },
  );
};

export { getPendingEventsReportDetails, downloadPendingEventsReportPdf };
export type { PendingEventsReportQueryParams };
