import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { PaginationData } from "../interfaces/definitions";
import type { Basis } from "../interfaces/references/Basis";
// import { Unit } from "../interfaces/references/Unit";

const loadBasises = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.BASIS.GET_BY_PAGINATION,
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

const createNewBasis = async (newUnit: Basis) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.BASIS.POST,
    newUnit,
  );
};

const updateEditBasis = async (code: string, existingBasis: Basis) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.BASIS.PUT,
    existingBasis,
    {
      params: {
        code: code,
      },
    },
  );
};

const removeBasis = async (code: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.BASIS.DELETE + code, // buyercode pass by route
  );
};

export { loadBasises, createNewBasis, updateEditBasis, removeBasis };
