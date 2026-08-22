import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

const loadManpowerRequirementReport = async (
  buyerCode: number, order: string, typeCode: number, styleCode: string, lineCode: string | null,
) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.MANPOWER_REQUIREMENT_REPORT.GET, {
    params: { buyerCode, order, typeCode, styleCode, lineCode: lineCode || undefined },
  });
};

const downloadManpowerRequirementReportPdf = async (
  buyerCode: number, order: string, typeCode: number, styleCode: string, lineCode: string | null,
) => {
  return await client.get<Blob>(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.MANPOWER_REQUIREMENT_REPORT.PDF, {
    params: { buyerCode, order, typeCode, styleCode, lineCode: lineCode || undefined },
    responseType: "blob",
  });
};

export { loadManpowerRequirementReport, downloadManpowerRequirementReportPdf };
