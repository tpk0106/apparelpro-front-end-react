import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { CommercialInvoiceDetail } from "../../interfaces/import-export/ImportExport";

interface CommercialInvoiceListParams {
  pageSize: number;
  pageNumber: number;
  sortColumn?: string | null;
  sortOrder?: string | null;
  filterColumn?: string | null;
  filterQuery?: string | null;
}

const loadCommercialInvoices = async (params: CommercialInvoiceListParams) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.COMMERCIAL_INVOICE.LIST, { params });
};

// invoiceNumber is always sent as a query param, never a path segment - real
// invoice numbers can contain "/" (e.g. "34/GC/LG/94"), which a path segment
// would split into extra path segments and 404 against a route.
const loadCommercialInvoiceByNumber = async (invoiceNumber: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.COMMERCIAL_INVOICE.GET, {
    params: { invoiceNumber },
  });
};

const saveCommercialInvoice = async (payload: CommercialInvoiceDetail) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.COMMERCIAL_INVOICE.SAVE, payload);
};

const deleteCommercialInvoice = async (invoiceNumber: string) => {
  return await client.delete(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.COMMERCIAL_INVOICE.DELETE, {
    params: { invoiceNumber },
  });
};

type CommercialInvoicePrintFormat = "full" | "fedex" | "srilanka";

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadCommercialInvoicePrintPdf = async (
  invoiceNumber: string, format: CommercialInvoicePrintFormat, printAssessmentNo: boolean,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.COMMERCIAL_INVOICE.PRINT_PDF,
    { params: { invoiceNumber, format, printAssessmentNo }, responseType: "blob" },
  );
};

export {
  loadCommercialInvoices, loadCommercialInvoiceByNumber, saveCommercialInvoice, deleteCommercialInvoice,
  downloadCommercialInvoicePrintPdf,
};
export type { CommercialInvoiceListParams, CommercialInvoicePrintFormat };
