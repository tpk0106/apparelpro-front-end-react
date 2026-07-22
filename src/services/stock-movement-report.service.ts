import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { PaginationAPIModel } from "../interfaces/references/ApiResult";
import type {
  StockMovementReportHeader,
  StockMovementReportLine,
  StockMovementReportLinesQueryParams,
} from "../components/orderwise-inventory/stock-movement-report.types";

const getStockMovementReportHeader = async (
  buyerCode: number,
  order: string,
) => {
  return await client.get<StockMovementReportHeader>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_MOVEMENT_REPORT.HEADER,
    { params: { buyerCode, order } },
  );
};

const getStockMovementReportLines = async (
  params: StockMovementReportLinesQueryParams,
) => {
  return await client.get<PaginationAPIModel<StockMovementReportLine>>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_MOVEMENT_REPORT.LINES,
    { params },
  );
};

// Streams the PDF as a blob — the caller turns it into a browser download.
const downloadStockMovementReportPdf = async (
  buyerCode: number,
  order: string,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_MOVEMENT_REPORT.PDF,
    { params: { buyerCode, order }, responseType: "blob" },
  );
};

export {
  getStockMovementReportHeader,
  getStockMovementReportLines,
  downloadStockMovementReportPdf,
};
