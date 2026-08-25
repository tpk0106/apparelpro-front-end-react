import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { GeneralGtnPrintReportDetails } from "../../../components/reports/general-inventory/gtn/general-gtn-print-report.types";

const getGeneralGtnPrintDetails = async (gtnNumber: string) => {
  return await client.get<GeneralGtnPrintReportDetails>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.GTN.PRINT,
    { params: { gtnNumber } },
  );
};

const downloadGeneralGtnPrintPdf = async (gtnNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.GTN.PRINT_PDF,
    { params: { gtnNumber }, responseType: "blob" },
  );
};

export { getGeneralGtnPrintDetails, downloadGeneralGtnPrintPdf };
