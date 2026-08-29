import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type {
  GeneralStockValuationReportHeader,
  GeneralStockValuationReportLine,
} from "../../../interfaces/general-inventory/general-stock-valuation-report.types";

interface ReportParams {
  storeCode: string;
  fromItemCode: string;
  toItemCode: string;
}

const getGeneralStockValuationReportHeader = async (params: ReportParams) => {
  return await client.get<GeneralStockValuationReportHeader>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.STOCK_VALUATION.HEADER,
    { params },
  );
};

const getGeneralStockValuationReportLines = async (params: ReportParams) => {
  return await client.get<GeneralStockValuationReportLine[]>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.STOCK_VALUATION.LINES,
    { params },
  );
};

const downloadGeneralStockValuationReportPdf = async (params: ReportParams) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.STOCK_VALUATION.PDF,
    { params, responseType: "blob" },
  );
};

export {
  getGeneralStockValuationReportHeader,
  getGeneralStockValuationReportLines,
  downloadGeneralStockValuationReportPdf,
};
export type { ReportParams as GeneralStockValuationReportParams };
