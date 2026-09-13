import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { ValueDeclarationDetail } from "../../interfaces/import-export/ImportExport";

interface ValueDeclarationListParams {
  pageSize: number;
  pageNumber: number;
  sortColumn?: string | null;
  sortOrder?: string | null;
  filterColumn?: string | null;
  filterQuery?: string | null;
}

const loadValueDeclarations = async (params: ValueDeclarationListParams) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.VALUE_DECLARATION.LIST, { params });
};

const loadValueDeclarationById = async (id: number) => {
  return await client.get(`${APPARELPRO_ENDPOINTS.REFERENCE_SECTION.VALUE_DECLARATION.GET}/${id}`);
};

const saveValueDeclaration = async (payload: ValueDeclarationDetail) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.VALUE_DECLARATION.SAVE, payload);
};

const deleteValueDeclaration = async (id: number) => {
  return await client.delete(`${APPARELPRO_ENDPOINTS.REFERENCE_SECTION.VALUE_DECLARATION.DELETE}/${id}`);
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadValueDeclarationPrintPdf = async (id: number) => {
  return await client.get<Blob>(
    `${APPARELPRO_ENDPOINTS.REFERENCE_SECTION.VALUE_DECLARATION.PRINT_PDF}/${id}/print/pdf`,
    { responseType: "blob" },
  );
};

export {
  loadValueDeclarations, loadValueDeclarationById, saveValueDeclaration, deleteValueDeclaration,
  downloadValueDeclarationPrintPdf,
};
export type { ValueDeclarationListParams };
