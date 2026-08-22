import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { PaginationData } from "../../interfaces/definitions";
import type { MachineType } from "../../interfaces/production/MachineType";

const loadMachineTypes = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.MACHINE_TYPE.GET_BY_PAGINATION,
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

const createNewMachineType = async (newMachineType: MachineType) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.MACHINE_TYPE.POST,
    newMachineType,
  );
};

const deleteMachineType = async (code: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.MACHINE_TYPE.DELETE + code,
  );
};

const updateEditMachineType = async (
  code: string,
  existingMachineType: MachineType,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.MACHINE_TYPE.PUT,
    existingMachineType,
    { params: { code: code } },
  );
};

export {
  loadMachineTypes,
  createNewMachineType,
  deleteMachineType,
  updateEditMachineType,
};
