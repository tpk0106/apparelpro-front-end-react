import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import { createNotePrintReportService } from "../note-print-report.factory";
import type { OrderGtnPrintReportDetails } from "../../../components/reports/general-inventory/ogtn/general-ogtn-print-report.types";

export const generalOgtnPrintReportService = createNotePrintReportService<OrderGtnPrintReportDetails>({
  print: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.OGTN.PRINT,
  printPdf: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.OGTN.PRINT_PDF,
  paramName: "ogtnNumber",
});
