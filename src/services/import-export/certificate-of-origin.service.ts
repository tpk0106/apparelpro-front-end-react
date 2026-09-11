import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { CertificateOfOriginDetail } from "../../interfaces/import-export/ImportExport";

// invoiceNumber is always sent as a query param, never a path segment - same
// reasoning as Commercial Invoice: real invoice numbers can contain "/".
const loadCertificateOfOriginByInvoiceNumber = async (invoiceNumber: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CERTIFICATE_OF_ORIGIN.GET, {
    params: { invoiceNumber },
  });
};

const saveCertificateOfOrigin = async (payload: CertificateOfOriginDetail) => {
  return await client.put(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CERTIFICATE_OF_ORIGIN.SAVE, payload);
};

const deleteCertificateOfOrigin = async (invoiceNumber: string) => {
  return await client.delete(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CERTIFICATE_OF_ORIGIN.DELETE, {
    params: { invoiceNumber },
  });
};

type CertificateOfOriginPrintFormat = "full" | "chamber";

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadCertificateOfOriginPrintPdf = async (invoiceNumber: string, format: CertificateOfOriginPrintFormat) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.CERTIFICATE_OF_ORIGIN.PRINT_PDF,
    { params: { invoiceNumber, format }, responseType: "blob" },
  );
};

export {
  loadCertificateOfOriginByInvoiceNumber, saveCertificateOfOrigin, deleteCertificateOfOrigin,
  downloadCertificateOfOriginPrintPdf,
};
export type { CertificateOfOriginPrintFormat };
