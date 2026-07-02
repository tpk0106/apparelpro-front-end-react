import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { CreatePortDestinationAPIModel } from "../interfaces/definitions";
import type { PaginationData } from "../interfaces/definitions";
import type { PortDestination } from "../interfaces/references/PortDestination";

const loadPortDestinations = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DESTINATION.GET_BY_PAGINATION,
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

const createNewPortDestination = async (
  createPortDestinationAPIModel: CreatePortDestinationAPIModel,
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DESTINATION.POST,
    createPortDestinationAPIModel,
  );
};

const updateEditPortDestination = async (
  id: number,
  countryCode: string,
  existingPortDestination: PortDestination,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DESTINATION.PUT,
    existingPortDestination,
    {
      params: {
        id: id,
        countryCode: countryCode,
      },
    },
  );
};

const removePortDestination = async (id: number, countryCode: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DESTINATION.DELETE +
      id +
      "/" +
      countryCode,
  );
};

export {
  loadPortDestinations,
  createNewPortDestination,
  updateEditPortDestination,
  removePortDestination,
};
