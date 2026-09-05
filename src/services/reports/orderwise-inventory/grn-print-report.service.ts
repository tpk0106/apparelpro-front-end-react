import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { GrnPrintReportDetails } from "../../../components/reports/orderwise-inventory/grn/grn-print-report.types";

const getGrnPrintDetails = async (grnNumber: string) => {
  return await client.get<GrnPrintReportDetails>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.GRN.PRINT,
    { params: { grnNumber } },
  );
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadGrnPrintPdf = async (grnNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.GRN.PRINT_PDF,
    { params: { grnNumber }, responseType: "blob" },
  );
};

export { getGrnPrintDetails, downloadGrnPrintPdf };
