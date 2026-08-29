import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import { createNotePrintReportService } from "../note-print-report.factory";
import type { GeneralPoPrintReportDetails } from "../../../components/reports/general-inventory/po/general-po-print-report.types";

export const generalPoPrintReportService = createNotePrintReportService<GeneralPoPrintReportDetails>({
  print: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.PO.PRINT,
  printPdf: APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.PO.PRINT_PDF,
  paramName: "poNumber",
});
