import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import { createNotePrintReportService } from "../note-print-report.factory";
import type { GeneralRtnPrintReportDetails } from "../../../components/reports/general-inventory/rtn/general-rtn-print-report.types";

export const generalRtnPrintReportService = createNotePrintReportService<GeneralRtnPrintReportDetails>({
  print: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.RTN.PRINT,
  printPdf: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.RTN.PRINT_PDF,
  paramName: "rtnNumber",
});
