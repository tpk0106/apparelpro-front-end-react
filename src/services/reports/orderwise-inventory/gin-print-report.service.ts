import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { GinPrintReportDetails } from "../../../components/reports/orderwise-inventory/gin/gin-print-report.types";

const getGinPrintDetails = async (ginNumber: string) => {
  return await client.get<GinPrintReportDetails>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.GIN.PRINT,
    { params: { ginNumber } },
  );
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadGinPrintPdf = async (ginNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.GIN.PRINT_PDF,
    { params: { ginNumber }, responseType: "blob" },
  );
};

export { getGinPrintDetails, downloadGinPrintPdf };
