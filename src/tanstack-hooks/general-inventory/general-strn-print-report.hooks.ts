import { createNotePrintReportHooks } from "../reports/note-print-report.factory";
import { generalStrnPrintReportService } from "../../services/reports/general-inventory/general-strn-print-report.service";
import type { GeneralStrnPrintReportDetails } from "../../components/reports/general-inventory/strn/general-strn-print-report.types";

export const {
  usePrintDetailsQuery: useGetGeneralStrnPrintDetailsQuery,
  useDownloadPdfMutation: useDownloadGeneralStrnPrintPdfMutation,
} = createNotePrintReportHooks<GeneralStrnPrintReportDetails>(
  generalStrnPrintReportService,
  "generalStrnPrintReportDetails",
  "General_SRN",
);
