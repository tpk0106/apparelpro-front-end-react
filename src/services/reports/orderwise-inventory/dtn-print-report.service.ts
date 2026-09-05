import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { DtnPrintReportDetails } from "../../../components/reports/orderwise-inventory/dtn/dtn-print-report.types";

const getDtnPrintDetails = async (dtnNumber: string) => {
  return await client.get<DtnPrintReportDetails>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.DTN.PRINT,
    { params: { dtnNumber } },
  );
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadDtnPrintPdf = async (dtnNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.DTN.PRINT_PDF,
    { params: { dtnNumber }, responseType: "blob" },
  );
};

export { getDtnPrintDetails, downloadDtnPrintPdf };
