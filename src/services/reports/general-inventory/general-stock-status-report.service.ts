import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type {
  GeneralStockStatusReportHeader,
  GeneralStockStatusReportLine,
} from "../../../interfaces/general-inventory/general-stock-status-report.types";

interface ReportParams {
  storeCode: string;
  month: number;
  year: number;
}

const getGeneralStockStatusReportHeader = async (params: ReportParams) => {
  return await client.get<GeneralStockStatusReportHeader>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.STOCK_STATUS.HEADER,
    { params },
  );
};

const getGeneralStockStatusReportLines = async (params: ReportParams) => {
  return await client.get<GeneralStockStatusReportLine[]>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.STOCK_STATUS.LINES,
    { params },
  );
};

const downloadGeneralStockStatusReportPdf = async (params: ReportParams) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.STOCK_STATUS.PDF,
    { params, responseType: "blob" },
  );
};

export {
  getGeneralStockStatusReportHeader,
  getGeneralStockStatusReportLines,
  downloadGeneralStockStatusReportPdf,
};
export type { ReportParams as GeneralStockStatusReportParams };
