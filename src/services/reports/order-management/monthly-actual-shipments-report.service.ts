import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { MonthlyActualShipmentsReport } from "../../../components/reports/order-management/monthly-actual-shipments-report/monthly-actual-shipments-report.types";

interface MonthlyActualShipmentsReportQueryParams {
  month: number;
  year: number;
}

const getMonthlyActualShipmentsReportDetails = async (
  params: MonthlyActualShipmentsReportQueryParams,
) => {
  return await client.get<MonthlyActualShipmentsReport>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.MONTHLY_ACTUAL_SHIPMENTS_REPORT.GET_DETAILS,
    { params },
  );
};

const downloadMonthlyActualShipmentsReportPdf = async (
  params: MonthlyActualShipmentsReportQueryParams,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.MONTHLY_ACTUAL_SHIPMENTS_REPORT.GET_PDF,
    { params, responseType: "blob" },
  );
};

export { getMonthlyActualShipmentsReportDetails, downloadMonthlyActualShipmentsReportPdf };
export type { MonthlyActualShipmentsReportQueryParams };
