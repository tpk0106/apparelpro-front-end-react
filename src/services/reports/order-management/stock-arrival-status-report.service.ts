import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { StockArrivalStatusReport } from "../../../components/reports/order-management/stock-arrival-status-report/stock-arrival-status-report.types";

interface StockArrivalStatusReportQueryParams {
  buyerCode: number;
  order: string;
  asOfDate: string;
}

const getStockArrivalStatusReportDetails = async (
  params: StockArrivalStatusReportQueryParams,
) => {
  return await client.get<StockArrivalStatusReport>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.STOCK_ARRIVAL_STATUS_REPORT.GET_DETAILS,
    { params },
  );
};

const downloadStockArrivalStatusReportPdf = async (
  params: StockArrivalStatusReportQueryParams,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.STOCK_ARRIVAL_STATUS_REPORT.GET_PDF,
    { params, responseType: "blob" },
  );
};

export { getStockArrivalStatusReportDetails, downloadStockArrivalStatusReportPdf };
export type { StockArrivalStatusReportQueryParams };
