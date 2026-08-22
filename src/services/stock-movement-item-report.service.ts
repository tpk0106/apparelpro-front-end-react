import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { PaginationAPIModel } from "../interfaces/references/ApiResult";
import type {
  StockMovementItemOption,
  StockMovementItemReportHeader,
  StockMovementItemReportLine,
  StockMovementItemReportLinesQueryParams,
} from "../components/orderwise-inventory/stock-movement-item-report.types";

const getStockMovementItemOptions = async (buyerCode: number, order: string) => {
  return await client.get<StockMovementItemOption[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_MOVEMENT_ITEM_REPORT.ITEMS,
    { params: { buyerCode, order } },
  );
};

const getStockMovementItemReportHeader = async (
  buyerCode: number,
  order: string,
  itemCode: string,
) => {
  return await client.get<StockMovementItemReportHeader>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_MOVEMENT_ITEM_REPORT.HEADER,
    { params: { buyerCode, order, itemCode } },
  );
};

const getStockMovementItemReportLines = async (
  params: StockMovementItemReportLinesQueryParams,
) => {
  return await client.get<PaginationAPIModel<StockMovementItemReportLine>>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_MOVEMENT_ITEM_REPORT.LINES,
    { params },
  );
};

// Streams the PDF as a blob — the caller turns it into a browser download.
const downloadStockMovementItemReportPdf = async (
  buyerCode: number,
  order: string,
  itemCode: string,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STOCK_MOVEMENT_ITEM_REPORT.PDF,
    { params: { buyerCode, order, itemCode }, responseType: "blob" },
  );
};

export {
  getStockMovementItemOptions,
  getStockMovementItemReportHeader,
  getStockMovementItemReportLines,
  downloadStockMovementItemReportPdf,
};
