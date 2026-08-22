import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { PaginationData } from "../../interfaces/definitions";
import type { NonProductiveHourCode } from "../../interfaces/production/NonProductiveHourCode";

const loadNonProductiveHourCodes = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.NON_PRODUCTIVE_HOUR_CODE
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

const createNewNonProductiveHourCode = async (
  newCode: NonProductiveHourCode,
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.NON_PRODUCTIVE_HOUR_CODE.POST,
    newCode,
  );
};

const deleteNonProductiveHourCode = async (code: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.NON_PRODUCTIVE_HOUR_CODE.DELETE +
      code,
  );
};

const updateEditNonProductiveHourCode = async (
  code: string,
  existingCode: NonProductiveHourCode,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.NON_PRODUCTIVE_HOUR_CODE.PUT,
    existingCode,
    { params: { code: code } },
  );
};

export {
  loadNonProductiveHourCodes,
  createNewNonProductiveHourCode,
  deleteNonProductiveHourCode,
  updateEditNonProductiveHourCode,
};
