import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type {
  GeneralStockMovementReportHeader,
  GeneralStockMovementReportLine,
} from "../../../interfaces/general-inventory/general-stock-movement-report.types";

interface ReportParams {
  storeCode: string;
  itemCode: string;
  month: number;
  year: number;
}

const getGeneralStockMovementReportHeader = async (params: ReportParams) => {
  return await client.get<GeneralStockMovementReportHeader>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.STOCK_MOVEMENT.HEADER,
    { params },
  );
};

const getGeneralStockMovementReportLines = async (params: ReportParams) => {
  return await client.get<GeneralStockMovementReportLine[]>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.STOCK_MOVEMENT.LINES,
    { params },
  );
};

const downloadGeneralStockMovementReportPdf = async (params: ReportParams) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY_REPORTS.STOCK_MOVEMENT.PDF,
    { params, responseType: "blob" },
  );
};

export {
  getGeneralStockMovementReportHeader,
  getGeneralStockMovementReportLines,
  downloadGeneralStockMovementReportPdf,
};
export type { ReportParams as GeneralStockMovementReportParams };
