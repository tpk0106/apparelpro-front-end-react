import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { PaginationData } from "../../interfaces/definitions";
import type { OrderItemFeature } from "../../interfaces/references/OrderItemFeature";

const loadOrderItemFeatures = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ORDER_ITEM_FEATURE.GET_BY_PAGINATION,
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

const createNewOrderItemFeature = async (
  newOrderItemFeature: OrderItemFeature,
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ORDER_ITEM_FEATURE.POST,
    newOrderItemFeature,
  );
};

const updateEditOrderItemFeature = async (
  stockCode: string,
  itemCode: string,
  existingOrderItemFeature: OrderItemFeature,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ORDER_ITEM_FEATURE.PUT,
    existingOrderItemFeature,
    {
      params: {
        stockCode,
        itemCode,
      },
    },
  );
};

const removeOrderItemFeature = async (stockCode: string, itemCode: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ORDER_ITEM_FEATURE.DELETE,
    {
      params: {
        stockCode,
        itemCode,
      },
    },
  );
};

export {
  loadOrderItemFeatures,
  createNewOrderItemFeature,
  updateEditOrderItemFeature,
  removeOrderItemFeature,
};
