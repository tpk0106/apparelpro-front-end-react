import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

const loadMonthlyEmployeeEfficiencyReport = async (year: number, month: number) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.MONTHLY_EMPLOYEE_EFFICIENCY_REPORT.GET, {
    params: { year, month },
  });
};

const downloadMonthlyEmployeeEfficiencyReportPdf = async (year: number, month: number) => {
  return await client.get<Blob>(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.MONTHLY_EMPLOYEE_EFFICIENCY_REPORT.PDF, {
    params: { year, month },
    responseType: "blob",
  });
};

export { loadMonthlyEmployeeEfficiencyReport, downloadMonthlyEmployeeEfficiencyReportPdf };
