import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { OrderQuotaDetailReport } from "../../../components/reports/order-management/order-quota-detail-report/order-quota-detail-report.types";

interface OrderQuotaDetailReportQueryParams {
  buyerCode?: number;
  order?: string;
}

const getOrderQuotaDetailReportDetails = async (
  params: OrderQuotaDetailReportQueryParams,
) => {
  return await client.get<OrderQuotaDetailReport>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.ORDER_QUOTA_DETAIL_REPORT.GET_DETAILS,
    { params },
  );
};

const downloadOrderQuotaDetailReportPdf = async (
  params: OrderQuotaDetailReportQueryParams,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.ORDER_QUOTA_DETAIL_REPORT.GET_PDF,
    { params, responseType: "blob" },
  );
};

export { getOrderQuotaDetailReportDetails, downloadOrderQuotaDetailReportPdf };
export type { OrderQuotaDetailReportQueryParams };
