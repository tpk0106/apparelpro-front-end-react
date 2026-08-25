import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { GeneralDgnPrintReportDetails } from "../../../components/reports/general-inventory/dgn/general-dgn-print-report.types";

const getGeneralDgnPrintDetails = async (dgnNumber: string) => {
  return await client.get<GeneralDgnPrintReportDetails>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.DGN.PRINT,
    { params: { dgnNumber } },
  );
};

const downloadGeneralDgnPrintPdf = async (dgnNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.DGN.PRINT_PDF,
    { params: { dgnNumber }, responseType: "blob" },
  );
};

export { getGeneralDgnPrintDetails, downloadGeneralDgnPrintPdf };
