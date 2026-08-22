import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

const loadDailyEmployeeEfficiencyReport = async (date: string, lineCode: string | null) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DAILY_EMPLOYEE_EFFICIENCY_REPORT.GET, {
    params: { date, lineCode: lineCode || undefined },
  });
};

const downloadDailyEmployeeEfficiencyReportPdf = async (date: string, lineCode: string | null) => {
  return await client.get<Blob>(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DAILY_EMPLOYEE_EFFICIENCY_REPORT.PDF, {
    params: { date, lineCode: lineCode || undefined },
    responseType: "blob",
  });
};

export { loadDailyEmployeeEfficiencyReport, downloadDailyEmployeeEfficiencyReportPdf };
