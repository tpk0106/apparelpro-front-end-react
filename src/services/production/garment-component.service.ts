import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { PaginationData } from "../../interfaces/definitions";
import type { GarmentComponent } from "../../interfaces/production/GarmentComponent";

const loadGarmentComponents = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.GARMENT_COMPONENT
      .GET_BY_PAGINATION,
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

const createNewGarmentComponent = async (
  newGarmentComponent: GarmentComponent,
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.GARMENT_COMPONENT.POST,
    newGarmentComponent,
  );
};

const deleteGarmentComponent = async (componentCode: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.GARMENT_COMPONENT.DELETE +
      componentCode,
  );
};

const updateEditGarmentComponent = async (
  componentCode: string,
  existingGarmentComponent: GarmentComponent,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.GARMENT_COMPONENT.PUT,
    existingGarmentComponent,
    { params: { componentCode: componentCode } },
  );
};

export {
  loadGarmentComponents,
  createNewGarmentComponent,
  deleteGarmentComponent,
  updateEditGarmentComponent,
};
