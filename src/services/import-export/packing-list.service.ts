import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { SavePackingList } from "../../interfaces/import-export/ImportExport";

const loadPackingListByLineKey = async (
  invoiceNumber: string, buyerCode: number, order: string, typeCode: number, styleCode: string, newOrder: string,
) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PACKING_LIST.GET, {
    params: { invoiceNumber, buyerCode, order, typeCode, styleCode, newOrder },
  });
};

const savePackingList = async (payload: SavePackingList) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PACKING_LIST.SAVE, payload);
};

type PackingListPrintFormat = "cartons" | "hanging";

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadPackingListPrintPdf = async (
  invoiceNumber: string, buyerCode: number, order: string, typeCode: number, styleCode: string, newOrder: string,
  format: PackingListPrintFormat,
) => {
  return await client.get<Blob>(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PACKING_LIST.PRINT_PDF, {
    params: { invoiceNumber, buyerCode, order, typeCode, styleCode, newOrder, format },
    responseType: "blob",
  });
};

export { loadPackingListByLineKey, savePackingList, downloadPackingListPrintPdf };
export type { PackingListPrintFormat };
