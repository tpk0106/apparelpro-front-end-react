import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

const loadProductionScheduleReport = async (fromDate: string, toDate: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_SCHEDULE_REPORT.GET, {
    params: { fromDate, toDate },
  });
};

const downloadProductionScheduleReportPdf = async (fromDate: string, toDate: string) => {
  return await client.get<Blob>(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_SCHEDULE_REPORT.PDF, {
    params: { fromDate, toDate },
    responseType: "blob",
  });
};

export { loadProductionScheduleReport, downloadProductionScheduleReportPdf };
