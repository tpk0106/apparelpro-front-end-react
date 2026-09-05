import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { RtnPrintReportDetails } from "../../../components/reports/orderwise-inventory/rtn/rtn-print-report.types";

const getRtnPrintDetails = async (rtnNumber: string) => {
  return await client.get<RtnPrintReportDetails>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.RTN.PRINT,
    { params: { rtnNumber } },
  );
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadRtnPrintPdf = async (rtnNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.RTN.PRINT_PDF,
    { params: { rtnNumber }, responseType: "blob" },
  );
};

export { getRtnPrintDetails, downloadRtnPrintPdf };
