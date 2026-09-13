import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { BoatNoteDetail } from "../../interfaces/import-export/ImportExport";

// invoiceNumber is always sent as a query param, never a path segment - same
// reasoning as Commercial Invoice: real invoice numbers can contain "/".
const loadBoatNoteByInvoiceNumber = async (invoiceNumber: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.BOAT_NOTE.GET, {
    params: { invoiceNumber },
  });
};

const saveBoatNote = async (payload: BoatNoteDetail) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.BOAT_NOTE.SAVE, payload);
};

const deleteBoatNote = async (invoiceNumber: string) => {
  return await client.delete(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.BOAT_NOTE.DELETE, {
    params: { invoiceNumber },
  });
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadBoatNotePrintPdf = async (invoiceNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.BOAT_NOTE.PRINT_PDF,
    { params: { invoiceNumber }, responseType: "blob" },
  );
};

export { loadBoatNoteByInvoiceNumber, saveBoatNote, deleteBoatNote, downloadBoatNotePrintPdf };
