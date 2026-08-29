import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import { createNotePrintReportService } from "../note-print-report.factory";
import type { GeneralDgnPrintReportDetails } from "../../../components/reports/general-inventory/dgn/general-dgn-print-report.types";

export const generalDgnPrintReportService = createNotePrintReportService<GeneralDgnPrintReportDetails>({
  print: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.DGN.PRINT,
  printPdf: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.DGN.PRINT_PDF,
  paramName: "dgnNumber",
});
