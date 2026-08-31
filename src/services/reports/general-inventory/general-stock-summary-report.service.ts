import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type {
  GeneralStockSummaryReportHeader,
  GeneralStockSummaryReportLine,
} from "../../../interfaces/general-inventory/general-stock-summary-report.types";

interface ReportParams {
  month: number;
  year: number;
  currency1: string;
  currency2: string;
}

const getGeneralStockSummaryReportHeader = async (params: ReportParams) => {
  return await client.get<GeneralStockSummaryReportHeader>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.STOCK_SUMMARY.HEADER,
    { params },
  );
};

const getGeneralStockSummaryReportLines = async (params: ReportParams) => {
  return await client.get<GeneralStockSummaryReportLine[]>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.STOCK_SUMMARY.LINES,
    { params },
  );
};

const downloadGeneralStockSummaryReportPdf = async (params: ReportParams) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.STOCK_SUMMARY.PDF,
    { params, responseType: "blob" },
  );
};

export {
  getGeneralStockSummaryReportHeader,
  getGeneralStockSummaryReportLines,
  downloadGeneralStockSummaryReportPdf,
};
export type { ReportParams as GeneralStockSummaryReportParams };
