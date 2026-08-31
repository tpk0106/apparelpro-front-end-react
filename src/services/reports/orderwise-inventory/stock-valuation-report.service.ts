import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type {
  StockValuationReportHeader,
  StockValuationReportLine,
} from "../../../interfaces/orderwise-inventory/stock-valuation-report.types";

interface ReportParams {
  buyerCode: number;
  order: string;
}

const getStockValuationReportHeader = async (params: ReportParams) => {
  return await client.get<StockValuationReportHeader>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_VALUATION_REPORT.HEADER,
    { params },
  );
};

const getStockValuationReportLines = async (params: ReportParams) => {
  return await client.get<StockValuationReportLine[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_VALUATION_REPORT.LINES,
    { params },
  );
};

const downloadStockValuationReportPdf = async (params: ReportParams) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_VALUATION_REPORT.PDF,
    { params, responseType: "blob" },
  );
};

export {
  getStockValuationReportHeader,
  getStockValuationReportLines,
  downloadStockValuationReportPdf,
};
export type { ReportParams as StockValuationReportParams };
