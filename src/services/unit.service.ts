import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { PaginationData } from "../interfaces/definitions";
import type { Unit } from "../interfaces/references/Unit";

const loadUnits = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.UNIT.GET_BY_PAGINATION,
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

const createNewUnit = async (newUnit: Unit) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.UNIT.POST,
    newUnit,
  );
};

const updateEditUnit = async (id: number, existingUnit: Unit) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.UNIT.PUT,
    existingUnit,
    {
      params: {
        id: id,
      },
    },
  );
};

const removeUnit = async (id: number) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.UNIT.DELETE + id, // buyercode pass by route
  );
};

export { loadUnits, createNewUnit, updateEditUnit, removeUnit };
