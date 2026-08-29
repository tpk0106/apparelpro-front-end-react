import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import { createNotePrintReportService } from "../note-print-report.factory";
import type { GeneralSanPrintReportDetails } from "../../../components/reports/general-inventory/san/general-san-print-report.types";

export const generalSanPrintReportService = createNotePrintReportService<GeneralSanPrintReportDetails>({
  print: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.SAN.PRINT,
  printPdf: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.SAN.PRINT_PDF,
  paramName: "sanNumber",
});
