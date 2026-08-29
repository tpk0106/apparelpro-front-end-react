import { createNotePrintReportHooks } from "../reports/note-print-report.factory";
import { generalGrnPrintReportService } from "../../services/reports/general-inventory/general-grn-print-report.service";
import type { GeneralGrnPrintReportDetails } from "../../components/reports/general-inventory/grn/general-grn-print-report.types";

export const {
  usePrintDetailsQuery: useGetGeneralGrnPrintDetailsQuery,
  useDownloadPdfMutation: useDownloadGeneralGrnPrintPdfMutation,
} = createNotePrintReportHooks<GeneralGrnPrintReportDetails>(
  generalGrnPrintReportService,
  "generalGrnPrintReportDetails",
  "General_GRN",
);
