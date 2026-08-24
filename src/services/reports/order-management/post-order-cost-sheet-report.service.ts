import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { PostOrderCostSheetReport } from "../../../components/reports/order-management/post-order-cost-sheet-report/post-order-cost-sheet-report.types";

interface PostOrderCostSheetReportQueryParams {
  buyerCode: number;
  order: string;
  percentOfTotalValue: number;
  freightCharges: number;
  actualShippedDate: string | null;
}

const getPostOrderCostSheetReportDetails = async (
  params: PostOrderCostSheetReportQueryParams,
) => {
  return await client.get<PostOrderCostSheetReport>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.POST_ORDER_COST_SHEET_REPORT.GET_DETAILS,
    { params },
  );
};

const downloadPostOrderCostSheetReportPdf = async (
  params: PostOrderCostSheetReportQueryParams,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.POST_ORDER_COST_SHEET_REPORT.GET_PDF,
    { params, responseType: "blob" },
  );
};

export { getPostOrderCostSheetReportDetails, downloadPostOrderCostSheetReportPdf };
export type { PostOrderCostSheetReportQueryParams };
