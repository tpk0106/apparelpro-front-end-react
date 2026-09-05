import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { GtnPrintReportDetails } from "../../../components/reports/orderwise-inventory/gtn/gtn-print-report.types";

const getGtnPrintDetails = async (gtnNumber: string) => {
  return await client.get<GtnPrintReportDetails>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.GTN.PRINT,
    { params: { gtnNumber } },
  );
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadGtnPrintPdf = async (gtnNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.GTN.PRINT_PDF,
    { params: { gtnNumber }, responseType: "blob" },
  );
};

export { getGtnPrintDetails, downloadGtnPrintPdf };
