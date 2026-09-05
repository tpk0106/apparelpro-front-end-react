import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { SrnPrintReportDetails } from "../../../components/reports/orderwise-inventory/srn/srn-print-report.types";

const getSrnPrintDetails = async (srnNumber: string) => {
  return await client.get<SrnPrintReportDetails>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.SRN.PRINT,
    { params: { srnNumber } },
  );
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadSrnPrintPdf = async (srnNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.SRN.PRINT_PDF,
    { params: { srnNumber }, responseType: "blob" },
  );
};

export { getSrnPrintDetails, downloadSrnPrintPdf };
