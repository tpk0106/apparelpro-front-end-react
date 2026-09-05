import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { DgnPrintReportDetails } from "../../../components/reports/orderwise-inventory/dgn/dgn-print-report.types";

const getDgnPrintDetails = async (dgnNumber: string) => {
  return await client.get<DgnPrintReportDetails>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.DGN.PRINT,
    { params: { dgnNumber } },
  );
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadDgnPrintPdf = async (dgnNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.DGN.PRINT_PDF,
    { params: { dgnNumber }, responseType: "blob" },
  );
};

export { getDgnPrintDetails, downloadDgnPrintPdf };
