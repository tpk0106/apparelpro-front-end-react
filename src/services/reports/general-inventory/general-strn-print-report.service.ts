import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { GeneralStrnPrintReportDetails } from "../../../components/reports/general-inventory/strn/general-strn-print-report.types";

const getGeneralStrnPrintDetails = async (srnNumber: string) => {
  return await client.get<GeneralStrnPrintReportDetails>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.STRN.PRINT,
    { params: { srnNumber } },
  );
};

const downloadGeneralStrnPrintPdf = async (srnNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.STRN.PRINT_PDF,
    { params: { srnNumber }, responseType: "blob" },
  );
};

export { getGeneralStrnPrintDetails, downloadGeneralStrnPrintPdf };
