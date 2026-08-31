import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type {
  GeneralPurchaseOrderListReportHeader,
  GeneralPurchaseOrderListReportLine,
} from "../../../interfaces/general-inventory/general-purchase-order-list-report.types";

interface ReportParams {
  fromDate: string;
  toDate: string;
}

const getGeneralPurchaseOrderListReportHeader = async (params: ReportParams) => {
  return await client.get<GeneralPurchaseOrderListReportHeader>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.PURCHASE_ORDER_LIST.HEADER,
    { params },
  );
};

const getGeneralPurchaseOrderListReportLines = async (params: ReportParams) => {
  return await client.get<GeneralPurchaseOrderListReportLine[]>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.PURCHASE_ORDER_LIST.LINES,
    { params },
  );
};

const downloadGeneralPurchaseOrderListReportPdf = async (params: ReportParams) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.PURCHASE_ORDER_LIST.PDF,
    { params, responseType: "blob" },
  );
};

export {
  getGeneralPurchaseOrderListReportHeader,
  getGeneralPurchaseOrderListReportLines,
  downloadGeneralPurchaseOrderListReportPdf,
};
export type { ReportParams as GeneralPurchaseOrderListReportParams };
