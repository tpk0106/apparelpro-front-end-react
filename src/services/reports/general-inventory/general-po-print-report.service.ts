import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { GeneralPoPrintReportDetails } from "../../../components/reports/general-inventory/po/general-po-print-report.types";

const getGeneralPoPrintDetails = async (poNumber: string) => {
  return await client.get<GeneralPoPrintReportDetails>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.PO.PRINT,
    { params: { poNumber } },
  );
};

const downloadGeneralPoPrintPdf = async (poNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.PO.PRINT_PDF,
    { params: { poNumber }, responseType: "blob" },
  );
};

export { getGeneralPoPrintDetails, downloadGeneralPoPrintPdf };
