import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import { createNotePrintReportService } from "../note-print-report.factory";
import type { GeneralSrtnPrintReportDetails } from "../../../components/reports/general-inventory/srtn/general-srtn-print-report.types";

export const generalSrtnPrintReportService = createNotePrintReportService<GeneralSrtnPrintReportDetails>({
  print: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.SRTN.PRINT,
  printPdf: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.SRTN.PRINT_PDF,
  paramName: "srtnNumber",
});
