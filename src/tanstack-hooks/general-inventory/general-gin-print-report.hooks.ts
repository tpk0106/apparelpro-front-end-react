import { createNotePrintReportHooks } from "../reports/note-print-report.factory";
import { generalGinPrintReportService } from "../../services/reports/general-inventory/general-gin-print-report.service";
import type { GeneralGinPrintReportDetails } from "../../components/reports/general-inventory/gin/general-gin-print-report.types";

export const {
  usePrintDetailsQuery: useGetGeneralGinPrintDetailsQuery,
  useDownloadPdfMutation: useDownloadGeneralGinPrintPdfMutation,
} = createNotePrintReportHooks<GeneralGinPrintReportDetails>(
  generalGinPrintReportService,
  "generalGinPrintReportDetails",
  "General_GIN",
);
