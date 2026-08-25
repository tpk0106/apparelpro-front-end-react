import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { GeneralGrnPrintReportDetails } from "../../../components/reports/general-inventory/grn/general-grn-print-report.types";

const getGeneralGrnPrintDetails = async (grnNumber: string) => {
  return await client.get<GeneralGrnPrintReportDetails>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.GRN.PRINT,
    { params: { grnNumber } },
  );
};

const downloadGeneralGrnPrintPdf = async (grnNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.GRN.PRINT_PDF,
    { params: { grnNumber }, responseType: "blob" },
  );
};

export { getGeneralGrnPrintDetails, downloadGeneralGrnPrintPdf };
