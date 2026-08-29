import { createNotePrintReportHooks } from "../reports/note-print-report.factory";
import { generalGtnPrintReportService } from "../../services/reports/general-inventory/general-gtn-print-report.service";
import type { GeneralGtnPrintReportDetails } from "../../components/reports/general-inventory/gtn/general-gtn-print-report.types";

export const {
  usePrintDetailsQuery: useGetGeneralGtnPrintDetailsQuery,
  useDownloadPdfMutation: useDownloadGeneralGtnPrintPdfMutation,
} = createNotePrintReportHooks<GeneralGtnPrintReportDetails>(
  generalGtnPrintReportService,
  "generalGtnPrintReportDetails",
  "General_GTN",
);
