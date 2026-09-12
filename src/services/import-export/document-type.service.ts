import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { DocumentType } from "../../interfaces/import-export/ImportExport";

// DocumentType is the one CUSDEC reference master keyed by an auto Id instead
// of Code - composite-unique on (DocNo, DocTypeCode).
const loadDocumentTypes = async () => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DOCUMENT_TYPE.LIST, {
    params: { pageSize: 999, pageNumber: 1 },
  });
};

const createDocumentType = async (payload: Omit<DocumentType, "id">) => {
  return await client.post(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DOCUMENT_TYPE.POST, payload);
};

const updateDocumentType = async (id: number, payload: Omit<DocumentType, "id">) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DOCUMENT_TYPE.PUT, payload, {
    params: { id },
  });
};

const deleteDocumentType = async (id: number) => {
  return await client.delete(`${APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DOCUMENT_TYPE.DELETE}${id}`);
};

export { loadDocumentTypes, createDocumentType, updateDocumentType, deleteDocumentType };
