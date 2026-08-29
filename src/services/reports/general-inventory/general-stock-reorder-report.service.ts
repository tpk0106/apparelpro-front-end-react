import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type {
  GeneralStockReorderReportHeader,
  GeneralStockReorderReportLine,
} from "../../../interfaces/general-inventory/general-stock-reorder-report.types";

interface ReportParams {
  storeCode: string;
}

const getGeneralStockReorderReportHeader = async (params: ReportParams) => {
  return await client.get<GeneralStockReorderReportHeader>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.STOCK_REORDER.HEADER,
    { params },
  );
};

const getGeneralStockReorderReportLines = async (params: ReportParams) => {
  return await client.get<GeneralStockReorderReportLine[]>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.STOCK_REORDER.LINES,
    { params },
  );
};

const downloadGeneralStockReorderReportPdf = async (params: ReportParams) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.STOCK_REORDER.PDF,
    { params, responseType: "blob" },
  );
};

export {
  getGeneralStockReorderReportHeader,
  getGeneralStockReorderReportLines,
  downloadGeneralStockReorderReportPdf,
};
export type { ReportParams as GeneralStockReorderReportParams };
