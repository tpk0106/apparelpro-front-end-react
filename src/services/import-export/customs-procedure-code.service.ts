import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { CustomsProcedureCode } from "../../interfaces/import-export/ImportExport";

const loadCustomsProcedureCodes = async () => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CUSTOMS_PROCEDURE_CODE.LIST, {
    params: { pageSize: 999, pageNumber: 1 },
  });
};

const createCustomsProcedureCode = async (payload: CustomsProcedureCode) => {
  return await client.post(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CUSTOMS_PROCEDURE_CODE.POST, payload);
};

const updateCustomsProcedureCode = async (code: string, payload: CustomsProcedureCode) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CUSTOMS_PROCEDURE_CODE.PUT, payload, {
    params: { code },
  });
};

const deleteCustomsProcedureCode = async (code: string) => {
  return await client.delete(`${APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CUSTOMS_PROCEDURE_CODE.DELETE}${code}`);
};

export {
  loadCustomsProcedureCodes,
  createCustomsProcedureCode,
  updateCustomsProcedureCode,
  deleteCustomsProcedureCode,
};
