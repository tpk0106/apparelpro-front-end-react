import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { CompanyAddress } from "../../interfaces/import-export/ImportExport";

const loadCompanyAddresses = async () => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.IMPORT_EXPORT.COMPANY_ADDRESSES);
};

const saveCompanyAddress = async (payload: Omit<CompanyAddress, "id" | "addressNo"> & { id?: number }) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.IMPORT_EXPORT.COMPANY_ADDRESSES, payload);
};

const deleteCompanyAddress = async (id: number) => {
  return await client.delete(`${APPARELPRO_ENDPOINTS.REFERENCE_SECTION.IMPORT_EXPORT.COMPANY_ADDRESSES}/${id}`);
};

export { loadCompanyAddresses, saveCompanyAddress, deleteCompanyAddress };
