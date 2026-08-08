import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { OutstandingPurchaseOrderListReport } from "../../../components/reports/order-management/outstanding-purchase-order-list-report/outstanding-purchase-order-list-report.types";

interface OutstandingPurchaseOrderListReportQueryParams {
  startDate: string; // yyyy-MM-dd (DateOnly on the wire)
  endDate: string;
  basisCode?: string | null;
}

const getOutstandingPurchaseOrderListReportDetails = async (
  params: OutstandingPurchaseOrderListReportQueryParams,
) => {
  return await client.get<OutstandingPurchaseOrderListReport>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.OUTSTANDING_PURCHASE_ORDER_LIST_REPORT
      .GET_DETAILS,
    { params },
  );
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadOutstandingPurchaseOrderListReportPdf = async (
  params: OutstandingPurchaseOrderListReportQueryParams,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.OUTSTANDING_PURCHASE_ORDER_LIST_REPORT
      .GET_PDF,
    { params, responseType: "blob" },
  );
};

export {
  getOutstandingPurchaseOrderListReportDetails,
  downloadOutstandingPurchaseOrderListReportPdf,
};
export type { OutstandingPurchaseOrderListReportQueryParams };
