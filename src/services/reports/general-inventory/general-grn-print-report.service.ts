import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import { createNotePrintReportService } from "../note-print-report.factory";
import type { GeneralGrnPrintReportDetails } from "../../../components/reports/general-inventory/grn/general-grn-print-report.types";

export const generalGrnPrintReportService = createNotePrintReportService<GeneralGrnPrintReportDetails>({
  print: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.GRN.PRINT,
  printPdf: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.GRN.PRINT_PDF,
  paramName: "grnNumber",
});
