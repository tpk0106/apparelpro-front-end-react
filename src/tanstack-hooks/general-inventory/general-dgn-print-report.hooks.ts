import { createNotePrintReportHooks } from "../reports/note-print-report.factory";
import { generalDgnPrintReportService } from "../../services/reports/general-inventory/general-dgn-print-report.service";
import type { GeneralDgnPrintReportDetails } from "../../components/reports/general-inventory/dgn/general-dgn-print-report.types";

export const {
  usePrintDetailsQuery: useGetGeneralDgnPrintDetailsQuery,
  useDownloadPdfMutation: useDownloadGeneralDgnPrintPdfMutation,
} = createNotePrintReportHooks<GeneralDgnPrintReportDetails>(
  generalDgnPrintReportService,
  "generalDgnPrintReportDetails",
  "General_DGN",
);
