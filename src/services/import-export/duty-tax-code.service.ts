import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { DutyTaxCode } from "../../interfaces/import-export/ImportExport";

const loadDutyTaxCodes = async () => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DUTY_TAX_CODE.LIST, {
    params: { pageSize: 999, pageNumber: 1 },
  });
};

const createDutyTaxCode = async (payload: DutyTaxCode) => {
  return await client.post(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DUTY_TAX_CODE.POST, payload);
};

const updateDutyTaxCode = async (code: string, payload: DutyTaxCode) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DUTY_TAX_CODE.PUT, payload, {
    params: { code },
  });
};

const deleteDutyTaxCode = async (code: string) => {
  return await client.delete(`${APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DUTY_TAX_CODE.DELETE}${code}`);
};

export { loadDutyTaxCodes, createDutyTaxCode, updateDutyTaxCode, deleteDutyTaxCode };
