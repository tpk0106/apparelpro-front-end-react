import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { ClearanceOffice } from "../../interfaces/import-export/ImportExport";

// Small reference master (CUSDEC I/II) - fetched with a large pageSize
// rather than real pagination UI, matching the Currency/Buyer lookup pattern.
const loadClearanceOffices = async () => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CLEARANCE_OFFICE.LIST, {
    params: { pageSize: 999, pageNumber: 1 },
  });
};

const createClearanceOffice = async (payload: ClearanceOffice) => {
  return await client.post(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CLEARANCE_OFFICE.POST, payload);
};

const updateClearanceOffice = async (code: string, payload: ClearanceOffice) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CLEARANCE_OFFICE.PUT, payload, {
    params: { code },
  });
};

const deleteClearanceOffice = async (code: string) => {
  return await client.delete(`${APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CLEARANCE_OFFICE.DELETE}${code}`);
};

export { loadClearanceOffices, createClearanceOffice, updateClearanceOffice, deleteClearanceOffice };
