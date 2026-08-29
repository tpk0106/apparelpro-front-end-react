import { createNotePrintReportHooks } from "../reports/note-print-report.factory";
import { generalSanPrintReportService } from "../../services/reports/general-inventory/general-san-print-report.service";
import type { GeneralSanPrintReportDetails } from "../../components/reports/general-inventory/san/general-san-print-report.types";

export const {
  usePrintDetailsQuery: useGetGeneralSanPrintDetailsQuery,
  useDownloadPdfMutation: useDownloadGeneralSanPrintPdfMutation,
} = createNotePrintReportHooks<GeneralSanPrintReportDetails>(
  generalSanPrintReportService,
  "generalSanPrintReportDetails",
  "General_SAN",
);
