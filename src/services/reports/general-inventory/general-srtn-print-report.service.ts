import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { GeneralSrtnPrintReportDetails } from "../../../components/reports/general-inventory/srtn/general-srtn-print-report.types";

const getGeneralSrtnPrintDetails = async (srtnNumber: string) => {
  return await client.get<GeneralSrtnPrintReportDetails>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.SRTN.PRINT,
    { params: { srtnNumber } },
  );
};

const downloadGeneralSrtnPrintPdf = async (srtnNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.SRTN.PRINT_PDF,
    { params: { srtnNumber }, responseType: "blob" },
  );
};

export { getGeneralSrtnPrintDetails, downloadGeneralSrtnPrintPdf };
