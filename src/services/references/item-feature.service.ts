import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { PaginationData } from "../../interfaces/definitions";
import type { ItemFeature } from "../../interfaces/references/ItemFeature";

const loadItemFeatures = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ITEM_FEATURE.GET_BY_PAGINATION,
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

const createNewItemFeature = async (newItemFeature: ItemFeature) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ITEM_FEATURE.POST,
    newItemFeature,
  );
};

const updateEditItemFeature = async (
  code: string,
  existingItemFeature: ItemFeature,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ITEM_FEATURE.PUT,
    existingItemFeature,
    {
      params: {
        featureCode: code,
      },
    },
  );
};

const removeItemFeature = async (code: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ITEM_FEATURE.DELETE + code, // buyercode pass by route
  );
};

export {
  loadItemFeatures,
  createNewItemFeature,
  updateEditItemFeature,
  removeItemFeature,
};
