import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

const loadProductionAnalysisSummaryReport = async (buyerCode: number, order: string, typeCode: number, styleCode: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_ANALYSIS_SUMMARY_REPORT.GET, {
    params: { buyerCode, order, typeCode, styleCode },
  });
};

const downloadProductionAnalysisSummaryReportPdf = async (buyerCode: number, order: string, typeCode: number, styleCode: string) => {
  return await client.get<Blob>(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_ANALYSIS_SUMMARY_REPORT.PDF, {
    params: { buyerCode, order, typeCode, styleCode },
    responseType: "blob",
  });
};

export { loadProductionAnalysisSummaryReport, downloadProductionAnalysisSummaryReportPdf };
