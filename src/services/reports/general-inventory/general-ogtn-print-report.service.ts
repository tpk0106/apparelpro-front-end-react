import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { OrderGtnPrintReportDetails } from "../../../components/reports/general-inventory/ogtn/general-ogtn-print-report.types";

const getOrderGtnPrintDetails = async (ogtnNumber: string) => {
  return await client.get<OrderGtnPrintReportDetails>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.OGTN.PRINT,
    { params: { ogtnNumber } },
  );
};

const downloadOrderGtnPrintPdf = async (ogtnNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.OGTN.PRINT_PDF,
    { params: { ogtnNumber }, responseType: "blob" },
  );
};

export { getOrderGtnPrintDetails, downloadOrderGtnPrintPdf };
