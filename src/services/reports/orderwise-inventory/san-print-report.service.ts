import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { SanPrintReportDetails } from "../../../components/reports/orderwise-inventory/san/san-print-report.types";

const getSanPrintDetails = async (sanNumber: string) => {
  return await client.get<SanPrintReportDetails>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.SAN.PRINT,
    { params: { sanNumber } },
  );
};

// Streams the PDF as a blob - the caller turns it into a browser download.
const downloadSanPrintPdf = async (sanNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.SAN.PRINT_PDF,
    { params: { sanNumber }, responseType: "blob" },
  );
};

export { getSanPrintDetails, downloadSanPrintPdf };
