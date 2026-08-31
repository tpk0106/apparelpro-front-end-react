import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type {
  StockStatusReportHeader,
  StockStatusReportLine,
} from "../../../interfaces/orderwise-inventory/stock-status-report.types";

interface ReportParams {
  buyerCode: number;
  order: string;
}

const getStockStatusReportHeader = async (params: ReportParams) => {
  return await client.get<StockStatusReportHeader>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_STATUS_REPORT.HEADER,
    { params },
  );
};

const getStockStatusReportLines = async (params: ReportParams) => {
  return await client.get<StockStatusReportLine[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_STATUS_REPORT.LINES,
    { params },
  );
};

const downloadStockStatusReportPdf = async (params: ReportParams) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_STATUS_REPORT.PDF,
    { params, responseType: "blob" },
  );
};

export { getStockStatusReportHeader, getStockStatusReportLines, downloadStockStatusReportPdf };
export type { ReportParams as StockStatusReportParams };
