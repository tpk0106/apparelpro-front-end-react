import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { TransportMode } from "../../interfaces/import-export/ImportExport";

const loadTransportModes = async () => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.TRANSPORT_MODE.LIST, {
    params: { pageSize: 999, pageNumber: 1 },
  });
};

const createTransportMode = async (payload: TransportMode) => {
  return await client.post(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.TRANSPORT_MODE.POST, payload);
};

const updateTransportMode = async (code: string, payload: TransportMode) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.TRANSPORT_MODE.PUT, payload, {
    params: { code },
  });
};

const deleteTransportMode = async (code: string) => {
  return await client.delete(`${APPARELPRO_ENDPOINTS.REFERENCE_SECTION.TRANSPORT_MODE.DELETE}${code}`);
};

export { loadTransportModes, createTransportMode, updateTransportMode, deleteTransportMode };
