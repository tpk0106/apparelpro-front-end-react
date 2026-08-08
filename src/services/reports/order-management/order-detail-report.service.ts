import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { OrderDetailReport } from "../../../components/reports/order-management/order-detail-report/order-detail-report.types";

interface OrderDetailReportQueryParams {
  buyerCode: number;
  order: string;
}

const getOrderDetailReportDetails = async (
  params: OrderDetailReportQueryParams,
) => {
  return await client.get<OrderDetailReport>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.ORDER_DETAIL_REPORT.GET_DETAILS,
    { params },
  );
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadOrderDetailReportPdf = async (
  params: OrderDetailReportQueryParams,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.ORDER_DETAIL_REPORT.GET_PDF,
    { params, responseType: "blob" },
  );
};

export { getOrderDetailReportDetails, downloadOrderDetailReportPdf };
export type { OrderDetailReportQueryParams };
