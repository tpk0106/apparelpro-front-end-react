import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { AgreementCode } from "../../interfaces/import-export/ImportExport";

const loadAgreementCodes = async () => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.AGREEMENT_CODE.LIST, {
    params: { pageSize: 999, pageNumber: 1 },
  });
};

const createAgreementCode = async (payload: AgreementCode) => {
  return await client.post(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.AGREEMENT_CODE.POST, payload);
};

const updateAgreementCode = async (code: string, payload: AgreementCode) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.AGREEMENT_CODE.PUT, payload, {
    params: { code },
  });
};

const deleteAgreementCode = async (code: string) => {
  return await client.delete(`${APPARELPRO_ENDPOINTS.REFERENCE_SECTION.AGREEMENT_CODE.DELETE}${code}`);
};

export { loadAgreementCodes, createAgreementCode, updateAgreementCode, deleteAgreementCode };
