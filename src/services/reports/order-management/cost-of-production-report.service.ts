import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { CostOfProductionReport } from "../../../components/reports/order-management/cost-of-production-report/cost-of-production-report.types";

interface CostOfProductionReportQueryParams {
  buyerCode: number;
  order: string;
}

const getCostOfProductionReportDetails = async (
  params: CostOfProductionReportQueryParams,
) => {
  return await client.get<CostOfProductionReport>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.COST_OF_PRODUCTION_REPORT.GET_DETAILS,
    { params },
  );
};

const downloadCostOfProductionReportPdf = async (
  params: CostOfProductionReportQueryParams,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.COST_OF_PRODUCTION_REPORT.GET_PDF,
    { params, responseType: "blob" },
  );
};

export { getCostOfProductionReportDetails, downloadCostOfProductionReportPdf };
export type { CostOfProductionReportQueryParams };
