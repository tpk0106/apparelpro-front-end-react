import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import { createNotePrintReportService } from "../note-print-report.factory";
import type { GeneralStrnPrintReportDetails } from "../../../components/reports/general-inventory/strn/general-strn-print-report.types";

export const generalStrnPrintReportService = createNotePrintReportService<GeneralStrnPrintReportDetails>({
  print: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.STRN.PRINT,
  printPdf: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.STRN.PRINT_PDF,
  paramName: "srnNumber",
});
