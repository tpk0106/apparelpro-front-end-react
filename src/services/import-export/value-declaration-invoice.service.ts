import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { ValueDeclarationDetail } from "../../interfaces/import-export/ImportExport";

// Invoice-scoped Value Declaration flow (one per Commercial Invoice) -
// additive alongside value-declaration.service.ts's standalone flow.
// invoiceNumber is always a query param, never a path segment - real
// invoice numbers can contain "/", same reasoning as Commercial Invoice.
const loadValueDeclarationByInvoiceNumber = async (invoiceNumber: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.VALUE_DECLARATION.DETAIL_BY_INVOICE, {
    params: { invoiceNumber },
  });
};

const saveValueDeclarationForInvoice = async (payload: ValueDeclarationDetail) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.VALUE_DECLARATION.SAVE_FOR_INVOICE, payload);
};

const deleteValueDeclarationForInvoice = async (invoiceNumber: string) => {
  return await client.delete(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.VALUE_DECLARATION.DELETE_FOR_INVOICE, {
    params: { invoiceNumber },
  });
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadValueDeclarationPrintPdfForInvoice = async (invoiceNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.VALUE_DECLARATION.PRINT_PDF_FOR_INVOICE,
    { params: { invoiceNumber }, responseType: "blob" },
  );
};

export {
  loadValueDeclarationByInvoiceNumber, saveValueDeclarationForInvoice, deleteValueDeclarationForInvoice,
  downloadValueDeclarationPrintPdfForInvoice,
};
