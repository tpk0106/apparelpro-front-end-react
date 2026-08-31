import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { ArnPrintReportDetails } from "../../../components/reports/orderwise-inventory/arn/arn-print-report.types";

const getArnPrintDetails = async (arnNumber: string) => {
  return await client.get<ArnPrintReportDetails>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.ARN.PRINT,
    { params: { arnNumber } },
  );
};

const downloadArnPrintPdf = async (arnNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.ARN.PRINT_PDF,
    { params: { arnNumber }, responseType: "blob" },
  );
};

export { getArnPrintDetails, downloadArnPrintPdf };
