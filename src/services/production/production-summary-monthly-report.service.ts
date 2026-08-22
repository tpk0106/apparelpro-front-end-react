import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

const loadProductionSummaryMonthlyReport = async (year: number, month: number) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_SUMMARY_MONTHLY_REPORT.GET, {
    params: { year, month },
  });
};

const loadProductionSummaryMonthlyOverviewReport = async (year: number, month: number) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_SUMMARY_MONTHLY_OVERVIEW_REPORT.GET, {
    params: { year, month },
  });
};

const downloadProductionSummaryMonthlyReportPdf = async (year: number, month: number) => {
  return await client.get<Blob>(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_SUMMARY_MONTHLY_REPORT.PDF, {
    params: { year, month },
    responseType: "blob",
  });
};

const downloadProductionSummaryMonthlyOverviewReportPdf = async (year: number, month: number) => {
  return await client.get<Blob>(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_SUMMARY_MONTHLY_OVERVIEW_REPORT.PDF, {
    params: { year, month },
    responseType: "blob",
  });
};

export {
  loadProductionSummaryMonthlyReport,
  loadProductionSummaryMonthlyOverviewReport,
  downloadProductionSummaryMonthlyReportPdf,
  downloadProductionSummaryMonthlyOverviewReportPdf,
};
