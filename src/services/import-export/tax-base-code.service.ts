import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { TaxBaseCode } from "../../interfaces/import-export/ImportExport";

const loadTaxBaseCodes = async () => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.TAX_BASE_CODE.LIST, {
    params: { pageSize: 999, pageNumber: 1 },
  });
};

const createTaxBaseCode = async (payload: TaxBaseCode) => {
  return await client.post(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.TAX_BASE_CODE.POST, payload);
};

const updateTaxBaseCode = async (code: string, payload: TaxBaseCode) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.TAX_BASE_CODE.PUT, payload, {
    params: { code },
  });
};

const deleteTaxBaseCode = async (code: string) => {
  return await client.delete(`${APPARELPRO_ENDPOINTS.REFERENCE_SECTION.TAX_BASE_CODE.DELETE}${code}`);
};

export { loadTaxBaseCodes, createTaxBaseCode, updateTaxBaseCode, deleteTaxBaseCode };
