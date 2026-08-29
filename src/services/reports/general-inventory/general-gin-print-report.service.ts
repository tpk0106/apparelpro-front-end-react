import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import { createNotePrintReportService } from "../note-print-report.factory";
import type { GeneralGinPrintReportDetails } from "../../../components/reports/general-inventory/gin/general-gin-print-report.types";

export const generalGinPrintReportService = createNotePrintReportService<GeneralGinPrintReportDetails>({
  print: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.GIN.PRINT,
  printPdf: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.GIN.PRINT_PDF,
  paramName: "ginNumber",
});
