import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { PaginationAPIModel } from "../interfaces/references/ApiResult";
import type { PaginationData } from "../interfaces/definitions";
import type { Department } from "../interfaces/references/Department";

const loadDepartmentsPaged = async (data: PaginationData) => {
  return await client.get<PaginationAPIModel<Department>>(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DEPARTMENT.GET_BY_PAGINATION,
    {
      params: {
        pageNumber: data.pageIndex,
        pageSize: data.pageSize,
        sortColumn: data.sortColumn || undefined,
        sortOrder: data.sortOrder || undefined,
        filterColumn: data.filterColumn || undefined,
        filterQuery: data.filterQuery || undefined,
      },
    },
  );
};

const loadAllDepartments = async () => {
  return await client.get<Department[]>(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DEPARTMENT.GET_ALL,
  );
};

export { loadDepartmentsPaged, loadAllDepartments };
