import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

const loadProductionSummaryStyleWiseReport = async (startDate: string, endDate: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_SUMMARY_STYLE_WISE_REPORT.GET, {
    params: { startDate, endDate },
  });
};

const loadProductionSummaryStyleWiseDetailedReport = async (startDate: string, endDate: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_SUMMARY_STYLE_WISE_DETAILED_REPORT.GET, {
    params: { startDate, endDate },
  });
};

const downloadProductionSummaryStyleWiseReportPdf = async (startDate: string, endDate: string) => {
  return await client.get<Blob>(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_SUMMARY_STYLE_WISE_REPORT.PDF, {
    params: { startDate, endDate },
    responseType: "blob",
  });
};

const downloadProductionSummaryStyleWiseDetailedReportPdf = async (startDate: string, endDate: string) => {
  return await client.get<Blob>(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_SUMMARY_STYLE_WISE_DETAILED_REPORT.PDF, {
    params: { startDate, endDate },
    responseType: "blob",
  });
};

export {
  loadProductionSummaryStyleWiseReport,
  loadProductionSummaryStyleWiseDetailedReport,
  downloadProductionSummaryStyleWiseReportPdf,
  downloadProductionSummaryStyleWiseDetailedReportPdf,
};
