import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type {
  StockSummaryReportHeader,
  StockSummaryReportLine,
} from "../../../interfaces/orderwise-inventory/stock-summary-report.types";

interface ReportParams {
  currency1: string;
  currency2: string;
}

const getStockSummaryReportHeader = async (params: ReportParams) => {
  return await client.get<StockSummaryReportHeader>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_SUMMARY_REPORT.HEADER,
    { params },
  );
};

const getStockSummaryReportLines = async (params: ReportParams) => {
  return await client.get<StockSummaryReportLine[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_SUMMARY_REPORT.LINES,
    { params },
  );
};

const downloadStockSummaryReportPdf = async (params: ReportParams) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_SUMMARY_REPORT.PDF,
    { params, responseType: "blob" },
  );
};

export { getStockSummaryReportHeader, getStockSummaryReportLines, downloadStockSummaryReportPdf };
export type { ReportParams as StockSummaryReportParams };
