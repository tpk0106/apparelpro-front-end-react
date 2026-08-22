import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { PaginationData } from "../../interfaces/definitions";
import type { Operation } from "../../interfaces/production/Operation";

const loadOperations = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.OPERATION.GET_BY_PAGINATION,
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

const createNewOperation = async (newOperation: Operation) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.OPERATION.POST,
    newOperation,
  );
};

const deleteOperation = async (operationCode: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.OPERATION.DELETE + operationCode,
  );
};

const updateEditOperation = async (
  operationCode: string,
  existingOperation: Operation,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.OPERATION.PUT,
    existingOperation,
    { params: { operationCode: operationCode } },
  );
};

export {
  loadOperations,
  createNewOperation,
  deleteOperation,
  updateEditOperation,
};
