import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { ExportLicenseDetail } from "../../interfaces/import-export/ImportExport";

interface ExportLicenseListParams {
  pageSize: number;
  pageNumber: number;
  sortColumn?: string | null;
  sortOrder?: string | null;
  filterColumn?: string | null;
  filterQuery?: string | null;
}

const loadExportLicenses = async (params: ExportLicenseListParams) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.EXPORT_LICENSE.LIST, { params });
};

const loadExportLicenseById = async (id: number) => {
  return await client.get(`${APPARELPRO_ENDPOINTS.REFERENCE_SECTION.EXPORT_LICENSE.GET}/${id}`);
};

const saveExportLicense = async (payload: ExportLicenseDetail) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.EXPORT_LICENSE.SAVE, payload);
};

const deleteExportLicense = async (id: number) => {
  return await client.delete(`${APPARELPRO_ENDPOINTS.REFERENCE_SECTION.EXPORT_LICENSE.DELETE}/${id}`);
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadExportLicensePrintPdf = async (id: number) => {
  return await client.get<Blob>(
    `${APPARELPRO_ENDPOINTS.REFERENCE_SECTION.EXPORT_LICENSE.PRINT_PDF}/${id}/print/pdf`,
    { responseType: "blob" },
  );
};

export {
  loadExportLicenses, loadExportLicenseById, saveExportLicense, deleteExportLicense, downloadExportLicensePrintPdf,
};
export type { ExportLicenseListParams };
