import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { CustomsDeclarationDetail } from "../../interfaces/import-export/ImportExport";

// Keyed by CusNo (the legacy CUSDEC No.), sent as a query param.
const loadCustomsDeclarationByCusNo = async (cusNo: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CUSTOMS_DECLARATION.GET, {
    params: { cusNo },
  });
};

const saveCustomsDeclaration = async (payload: CustomsDeclarationDetail) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CUSTOMS_DECLARATION.SAVE, payload);
};

const deleteCustomsDeclaration = async (cusNo: string) => {
  return await client.delete(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CUSTOMS_DECLARATION.DELETE, {
    params: { cusNo },
  });
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadCustomsDeclarationPrintPdf = async (cusNo: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CUSTOMS_DECLARATION.PRINT_PDF,
    { params: { cusNo }, responseType: "blob" },
  );
};

export {
  loadCustomsDeclarationByCusNo, saveCustomsDeclaration, deleteCustomsDeclaration,
  downloadCustomsDeclarationPrintPdf,
};
