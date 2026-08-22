import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { PaginationData } from "../../interfaces/definitions";
import type { ProductionLine } from "../../interfaces/production/ProductionLine";

const loadProductionLines = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_LINE.GET_BY_PAGINATION,
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

const createNewProductionLine = async (newProductionLine: ProductionLine) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_LINE.POST,
    newProductionLine,
  );
};

const deleteProductionLine = async (lineCode: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_LINE.DELETE + lineCode,
  );
};

const updateEditProductionLine = async (
  lineCode: string,
  existingProductionLine: ProductionLine,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_LINE.PUT,
    existingProductionLine,
    { params: { lineCode: lineCode } },
  );
};

export {
  loadProductionLines,
  createNewProductionLine,
  deleteProductionLine,
  updateEditProductionLine,
};
