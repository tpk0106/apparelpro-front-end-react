import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type {
  ItemCodeSearchResult,
  ItemWiseStockBalanceHeader,
  ItemWiseStockBalanceLine,
} from "../../../interfaces/orderwise-inventory/item-wise-stock-balance.types";

interface ReportParams {
  fromRange: string;
  toRange: string;
}

const getItemWiseStockBalanceHeader = async (params: ReportParams) => {
  return await client.get<ItemWiseStockBalanceHeader>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.ITEM_WISE_STOCK_BALANCE_REPORT.HEADER,
    { params },
  );
};

const getItemWiseStockBalanceLines = async (params: ReportParams) => {
  return await client.get<ItemWiseStockBalanceLine[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.ITEM_WISE_STOCK_BALANCE_REPORT.LINES,
    { params },
  );
};

const downloadItemWiseStockBalancePdf = async (params: ReportParams) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.ITEM_WISE_STOCK_BALANCE_REPORT.PDF,
    { params, responseType: "blob" },
  );
};

const searchItemCodes = async (query: string) => {
  return await client.get<ItemCodeSearchResult[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.ITEM_WISE_STOCK_BALANCE_REPORT.ITEM_SEARCH,
    { params: { query } },
  );
};

export {
  getItemWiseStockBalanceHeader,
  getItemWiseStockBalanceLines,
  downloadItemWiseStockBalancePdf,
  searchItemCodes,
};
export type { ReportParams as ItemWiseStockBalanceParams };
