import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

const loadProductionSummaryDailyReport = async (date: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_SUMMARY_DAILY_REPORT.GET, {
    params: { date },
  });
};

const downloadProductionSummaryDailyReportPdf = async (date: string) => {
  return await client.get<Blob>(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_SUMMARY_DAILY_REPORT.PDF, {
    params: { date },
    responseType: "blob",
  });
};

export { loadProductionSummaryDailyReport, downloadProductionSummaryDailyReportPdf };
