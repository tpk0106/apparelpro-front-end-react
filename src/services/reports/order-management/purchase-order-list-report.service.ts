import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { PurchaseOrderListReport } from "../../../components/reports/order-management/purchase-order-list-report/purchase-order-list-report.types";

const getPurchaseOrderNumbers = async () => {
  return await client.get<string[]>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.PURCHASE_ORDER_LIST_REPORT
      .GET_PO_NUMBERS,
  );
};

const getPurchaseOrderListReportDetails = async (
  purchaseOrderNumber: string,
) => {
  return await client.get<PurchaseOrderListReport>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.PURCHASE_ORDER_LIST_REPORT
      .GET_DETAILS,
    { params: { purchaseOrderNumber } },
  );
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadPurchaseOrderListReportPdf = async (
  purchaseOrderNumber: string,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.PURCHASE_ORDER_LIST_REPORT.GET_PDF,
    { params: { purchaseOrderNumber }, responseType: "blob" },
  );
};

export {
  getPurchaseOrderNumbers,
  getPurchaseOrderListReportDetails,
  downloadPurchaseOrderListReportPdf,
};
