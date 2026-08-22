import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

const loadOperationBreakdownReport = async (buyerCode: number, order: string, typeCode: number, styleCode: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.OPERATION_BREAKDOWN_REPORT.GET, {
    params: { buyerCode, order, typeCode, styleCode },
  });
};

const downloadOperationBreakdownReportPdf = async (buyerCode: number, order: string, typeCode: number, styleCode: string) => {
  return await client.get<Blob>(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.OPERATION_BREAKDOWN_REPORT.PDF, {
    params: { buyerCode, order, typeCode, styleCode },
    responseType: "blob",
  });
};

export { loadOperationBreakdownReport, downloadOperationBreakdownReportPdf };
