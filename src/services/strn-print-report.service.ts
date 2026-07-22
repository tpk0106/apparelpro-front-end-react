import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { StrnPrintReportDetails } from "../components/reports-orderwise-inventory/strn-print-report.types";

const getStrnPrintDetails = async (strnNumber: string) => {
  return await client.get<StrnPrintReportDetails>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STRN.PRINT,
    { params: { strnNumber } },
  );
};

// Streams the PDF as a blob — the caller turns it into a browser download.
const downloadStrnPrintPdf = async (strnNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STRN.PRINT_PDF,
    { params: { strnNumber }, responseType: "blob" },
  );
};

export { getStrnPrintDetails, downloadStrnPrintPdf };
