import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

const loadLineProductionSummaryReport = async (startDate: string, endDate: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.LINE_PRODUCTION_SUMMARY_REPORT.GET, {
    params: { startDate, endDate },
  });
};

const downloadLineProductionSummaryReportPdf = async (startDate: string, endDate: string) => {
  return await client.get<Blob>(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.LINE_PRODUCTION_SUMMARY_REPORT.PDF, {
    params: { startDate, endDate },
    responseType: "blob",
  });
};

export { loadLineProductionSummaryReport, downloadLineProductionSummaryReportPdf };
