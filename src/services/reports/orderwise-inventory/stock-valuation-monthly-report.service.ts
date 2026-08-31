import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type {
  StockValuationMonthlyReportHeader,
  StockValuationMonthlyReportLine,
} from "../../../interfaces/orderwise-inventory/stock-valuation-monthly-report.types";

interface ReportParams {
  fromDate: string;
  toDate: string;
}

const getStockValuationMonthlyReportHeader = async (params: ReportParams) => {
  return await client.get<StockValuationMonthlyReportHeader>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_VALUATION_MONTHLY_REPORT.HEADER,
    { params },
  );
};

const getStockValuationMonthlyReportLines = async (params: ReportParams) => {
  return await client.get<StockValuationMonthlyReportLine[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_VALUATION_MONTHLY_REPORT.LINES,
    { params },
  );
};

const downloadStockValuationMonthlyReportPdf = async (params: ReportParams) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_VALUATION_MONTHLY_REPORT.PDF,
    { params, responseType: "blob" },
  );
};

export {
  getStockValuationMonthlyReportHeader,
  getStockValuationMonthlyReportLines,
  downloadStockValuationMonthlyReportPdf,
};
export type { ReportParams as StockValuationMonthlyReportParams };
