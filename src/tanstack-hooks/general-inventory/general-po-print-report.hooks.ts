import { createNotePrintReportHooks } from "../reports/note-print-report.factory";
import { generalPoPrintReportService } from "../../services/reports/general-inventory/general-po-print-report.service";
import type { GeneralPoPrintReportDetails } from "../../components/reports/general-inventory/po/general-po-print-report.types";

export const {
  usePrintDetailsQuery: useGetGeneralPoPrintDetailsQuery,
  useDownloadPdfMutation: useDownloadGeneralPoPrintPdfMutation,
} = createNotePrintReportHooks<GeneralPoPrintReportDetails>(
  generalPoPrintReportService,
  "generalPoPrintReportDetails",
  "General_PO",
);
