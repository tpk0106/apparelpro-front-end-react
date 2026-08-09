import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { PaginationData } from "../../interfaces/definitions";
import type { OrderItemCatalog } from "../../interfaces/references/OrderItemCatalog";

const loadOrderItemCatalog = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ORDER_ITEM_CATALOG.GET_BY_PAGINATION,
    {
      params: {
        pageNumber: data.pageIndex,
        pageSize: data.pageSize,
        sortColumn: data.sortColumn,
        sortOrder: data.sortOrder,
        filterColumn: data.filterColumn,
        filterQuery: data.filterQuery,
      },
    },
  );
};

const createNewOrderItemCatalog = async (newOrderItemCatalog: OrderItemCatalog) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ORDER_ITEM_CATALOG.POST,
    newOrderItemCatalog,
  );
};

const updateEditOrderItemCatalog = async (
  stockCode: string,
  itemCode: string,
  existingOrderItemCatalog: OrderItemCatalog,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ORDER_ITEM_CATALOG.PUT,
    existingOrderItemCatalog,
    {
      params: { stockCode, itemCode },
    },
  );
};

const removeOrderItemCatalog = async (stockCode: string, itemCode: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ORDER_ITEM_CATALOG.DELETE,
    {
      params: { stockCode, itemCode },
    },
  );
};

export {
  loadOrderItemCatalog,
  createNewOrderItemCatalog,
  updateEditOrderItemCatalog,
  removeOrderItemCatalog,
};
