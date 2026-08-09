import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { PaginationData } from "../../interfaces/definitions";
import type { Stock } from "../../interfaces/references/Stock";

const loadStocks = async (data: PaginationData) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.STOCK.GET_BY_PAGINATION, {
    params: {
      pageNumber: data.pageIndex,
      pageSize: data.pageSize,
      sortColumn: data.sortColumn,
      sortOrder: data.sortOrder,
      filterColumn: data.filterColumn,
      filterQuery: data.filterQuery,
    },
  });
};

const createNewStock = async (newStock: Stock) => {
  return await client.post(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.STOCK.POST, newStock);
};

const updateEditStock = async (stockCode: string, existingStock: Stock) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.STOCK.PUT,
    existingStock,
    {
      params: { stockCode },
    },
  );
};

const removeStock = async (stockCode: string) => {
  return await client.delete(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.STOCK.DELETE, {
    params: { stockCode },
  });
};

export { loadStocks, createNewStock, updateEditStock, removeStock };
