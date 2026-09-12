import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { CommodityCode } from "../../interfaces/import-export/ImportExport";

const loadCommodityCodes = async () => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.COMMODITY_CODE.LIST, {
    params: { pageSize: 999, pageNumber: 1 },
  });
};

const createCommodityCode = async (payload: CommodityCode) => {
  return await client.post(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.COMMODITY_CODE.POST, payload);
};

const updateCommodityCode = async (code: string, payload: CommodityCode) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.COMMODITY_CODE.PUT, payload, {
    params: { code },
  });
};

const deleteCommodityCode = async (code: string) => {
  return await client.delete(`${APPARELPRO_ENDPOINTS.REFERENCE_SECTION.COMMODITY_CODE.DELETE}${code}`);
};

export { loadCommodityCodes, createCommodityCode, updateCommodityCode, deleteCommodityCode };
