import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { PaginationData } from "../../interfaces/definitions";
import type { Holiday } from "../../interfaces/production/Holiday";

const loadHolidays = async (data: PaginationData) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.HOLIDAY.GET_BY_PAGINATION, {
    params: {
      pageNumber: data.pageIndex,
      pageSize: data.pageSize,
      sortColumn: data.sortColumn,
      sortOrder: data.sortOrder,
      filterColumn: data.filterColumn,
      filterQuery: data.filterQuery,
    },
  });
};

const createNewHoliday = async (newHoliday: Holiday) => {
  return await client.post(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.HOLIDAY.POST, newHoliday);
};

const deleteHoliday = async (date: string) => {
  return await client.delete(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.HOLIDAY.DELETE + date);
};

export { loadHolidays, createNewHoliday, deleteHoliday };
