import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { PaginationData } from "../../interfaces/definitions";
import type { SubContractor } from "../../interfaces/references/SubContractor";

const loadSubContractors = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.SUB_CONTRACTOR.GET_BY_PAGINATION,
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

const createNewSubContractor = async (newSubContractor: SubContractor) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.SUB_CONTRACTOR.POST,
    newSubContractor,
  );
};

const updateEditSubContractor = async (
  code: string,
  existingSubContractor: SubContractor,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.SUB_CONTRACTOR.PUT,
    existingSubContractor,
    {
      params: { code },
    },
  );
};

const removeSubContractor = async (code: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.SUB_CONTRACTOR.DELETE,
    {
      params: { code },
    },
  );
};

export {
  loadSubContractors,
  createNewSubContractor,
  updateEditSubContractor,
  removeSubContractor,
};
