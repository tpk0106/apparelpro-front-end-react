import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { PaginationData } from "../../interfaces/definitions";
import type { AdditionalCost } from "../../interfaces/references/AdditionalCost";

const loadAdditionalCosts = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ADDITIONAL_COST.GET_BY_PAGINATION,
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

const createNewAdditionalCost = async (newAdditionalCost: AdditionalCost) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ADDITIONAL_COST.POST,
    newAdditionalCost,
  );
};

const updateEditAdditionalCost = async (
  code: string,
  existingAdditionalCost: AdditionalCost,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ADDITIONAL_COST.PUT,
    existingAdditionalCost,
    {
      params: { code },
    },
  );
};

const removeAdditionalCost = async (code: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ADDITIONAL_COST.DELETE,
    {
      params: { code },
    },
  );
};

export {
  loadAdditionalCosts,
  createNewAdditionalCost,
  updateEditAdditionalCost,
  removeAdditionalCost,
};
