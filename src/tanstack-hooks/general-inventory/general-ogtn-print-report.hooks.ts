import { createNotePrintReportHooks } from "../reports/note-print-report.factory";
import { generalOgtnPrintReportService } from "../../services/reports/general-inventory/general-ogtn-print-report.service";
import type { OrderGtnPrintReportDetails } from "../../components/reports/general-inventory/ogtn/general-ogtn-print-report.types";

export const {
  usePrintDetailsQuery: useGetOrderGtnPrintDetailsQuery,
  useDownloadPdfMutation: useDownloadOrderGtnPrintPdfMutation,
} = createNotePrintReportHooks<OrderGtnPrintReportDetails>(
  generalOgtnPrintReportService,
  "orderGtnPrintReportDetails",
  "General_OGTN",
);
