import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

const loadLineEfficiencyReport = async (lineCode: string, year: number, month: number) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.LINE_EFFICIENCY_REPORT.GET, {
    params: { lineCode, year, month },
  });
};

const downloadLineEfficiencyReportPdf = async (lineCode: string, year: number, month: number) => {
  return await client.get<Blob>(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.LINE_EFFICIENCY_REPORT.PDF, {
    params: { lineCode, year, month },
    responseType: "blob",
  });
};

export { loadLineEfficiencyReport, downloadLineEfficiencyReportPdf };
