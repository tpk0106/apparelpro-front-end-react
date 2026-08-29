import { createNotePrintReportHooks } from "../reports/note-print-report.factory";
import { generalRtnPrintReportService } from "../../services/reports/general-inventory/general-rtn-print-report.service";
import type { GeneralRtnPrintReportDetails } from "../../components/reports/general-inventory/rtn/general-rtn-print-report.types";

export const {
  usePrintDetailsQuery: useGetGeneralRtnPrintDetailsQuery,
  useDownloadPdfMutation: useDownloadGeneralRtnPrintPdfMutation,
} = createNotePrintReportHooks<GeneralRtnPrintReportDetails>(
  generalRtnPrintReportService,
  "generalRtnPrintReportDetails",
  "General_RTN",
);
