import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { PaginationData } from "../interfaces/definitions";
import type { GarmentType } from "../interfaces/references/GarmentType";

const loadAllGarmentTypes = async () => {
  return await client.get<GarmentType[]>(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.GARMENT_TYPE.GET_ALL_GARMENT_TYPES,
  );
};

const loadGarmentTypes = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.GARMENT_TYPE.GET_BY_PAGINATION,
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

const createNewGarmentType = async (newGarmentType: GarmentType) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.GARMENT_TYPE.POST,
    newGarmentType,
  );
};

const updateEditGarmentType = async (
  id: number,
  existingGarmentType: GarmentType,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.GARMENT_TYPE.PUT,
    existingGarmentType,
    {
      params: {
        id: id,
      },
    },
  );
};

const removeGarmentType = async (id: number) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.GARMENT_TYPE.DELETE + id, // buyercode pass by route
  );
};

export {
  loadGarmentTypes,
  loadAllGarmentTypes,
  createNewGarmentType,
  updateEditGarmentType,
  removeGarmentType,
};
