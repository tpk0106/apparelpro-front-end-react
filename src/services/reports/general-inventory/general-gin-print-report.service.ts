import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { GeneralGinPrintReportDetails } from "../../../components/reports/general-inventory/gin/general-gin-print-report.types";

const getGeneralGinPrintDetails = async (ginNumber: string) => {
  return await client.get<GeneralGinPrintReportDetails>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.GIN.PRINT,
    { params: { ginNumber } },
  );
};

const downloadGeneralGinPrintPdf = async (ginNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.GIN.PRINT_PDF,
    { params: { ginNumber }, responseType: "blob" },
  );
};

export { getGeneralGinPrintDetails, downloadGeneralGinPrintPdf };
