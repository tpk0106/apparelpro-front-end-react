import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { PaginationData } from "../../interfaces/definitions";
import type { Employee } from "../../interfaces/production/Employee";

const loadEmployees = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.EMPLOYEE.GET_BY_PAGINATION,
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

const createNewEmployee = async (newEmployee: Employee) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.EMPLOYEE.POST,
    newEmployee,
  );
};

const deleteEmployee = async (employeeCode: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.EMPLOYEE.DELETE + employeeCode,
  );
};

const updateEditEmployee = async (
  employeeCode: string,
  existingEmployee: Employee,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.EMPLOYEE.PUT,
    existingEmployee,
    { params: { employeeCode: employeeCode } },
  );
};

export {
  loadEmployees,
  createNewEmployee,
  deleteEmployee,
  updateEditEmployee,
};
