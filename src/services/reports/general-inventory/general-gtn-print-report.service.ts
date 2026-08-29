import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import { createNotePrintReportService } from "../note-print-report.factory";
import type { GeneralGtnPrintReportDetails } from "../../../components/reports/general-inventory/gtn/general-gtn-print-report.types";

export const generalGtnPrintReportService = createNotePrintReportService<GeneralGtnPrintReportDetails>({
  print: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.GTN.PRINT,
  printPdf: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.GTN.PRINT_PDF,
  paramName: "gtnNumber",
});
