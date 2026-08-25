import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { GeneralRtnPrintReportDetails } from "../../../components/reports/general-inventory/rtn/general-rtn-print-report.types";

const getGeneralRtnPrintDetails = async (rtnNumber: string) => {
  return await client.get<GeneralRtnPrintReportDetails>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.RTN.PRINT,
    { params: { rtnNumber } },
  );
};

const downloadGeneralRtnPrintPdf = async (rtnNumber: string) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.RTN.PRINT_PDF,
    { params: { rtnNumber }, responseType: "blob" },
  );
};

export { getGeneralRtnPrintDetails, downloadGeneralRtnPrintPdf };
