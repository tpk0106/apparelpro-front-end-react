import { createNotePrintReportHooks } from "../reports/note-print-report.factory";
import { generalSrtnPrintReportService } from "../../services/reports/general-inventory/general-srtn-print-report.service";
import type { GeneralSrtnPrintReportDetails } from "../../components/reports/general-inventory/srtn/general-srtn-print-report.types";

export const {
  usePrintDetailsQuery: useGetGeneralSrtnPrintDetailsQuery,
  useDownloadPdfMutation: useDownloadGeneralSrtnPrintPdfMutation,
} = createNotePrintReportHooks<GeneralSrtnPrintReportDetails>(
  generalSrtnPrintReportService,
  "generalSrtnPrintReportDetails",
  "General_SRTN",
);
