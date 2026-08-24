import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { PaginationData } from "../../interfaces/definitions";
import type { Season } from "../../interfaces/references/Season";

const loadSeasons = async (data: PaginationData) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.SEASON.GET_BY_PAGINATION, {
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

const createNewSeason = async (newSeason: Season) => {
  return await client.post(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.SEASON.POST, newSeason);
};

const updateEditSeason = async (code: string, existingSeason: Season) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.SEASON.PUT,
    existingSeason,
    { params: { code: code } },
  );
};

const removeSeason = async (code: string) => {
  return await client.delete(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.SEASON.DELETE + code);
};

export { loadSeasons, createNewSeason, updateEditSeason, removeSeason };
