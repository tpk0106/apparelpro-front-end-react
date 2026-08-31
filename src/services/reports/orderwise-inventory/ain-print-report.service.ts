import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { AinPrintReportDetails } from "../../../components/reports/orderwise-inventory/ain/ain-print-report.types";

const getAinPrintDetails = async (ainNumber: string) => {
  return await client.get<AinPrintReportDetails>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.AIN.PRINT,
    { params: { ainNumber } },
  );
};

const downloadAinPrintPdf = async (ainNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.AIN.PRINT_PDF,
    { params: { ainNumber }, responseType: "blob" },
  );
};

export { getAinPrintDetails, downloadAinPrintPdf };
