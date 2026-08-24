import { client } from "../../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../../api/api-configurations";
import type { YearSeasonOrdersReport } from "../../../components/reports/order-management/year-season-orders-report/year-season-orders-report.types";

interface YearSeasonOrdersReportQueryParams {
  year?: number;
  season?: string;
}

const getYearSeasonOrdersReportDetails = async (
  params: YearSeasonOrdersReportQueryParams,
) => {
  return await client.get<YearSeasonOrdersReport>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.YEAR_SEASON_ORDERS_REPORT.GET_DETAILS,
    { params },
  );
};

const downloadYearSeasonOrdersReportPdf = async (
  params: YearSeasonOrdersReportQueryParams,
) => {
  return await client.get<Blob>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.YEAR_SEASON_ORDERS_REPORT.GET_PDF,
    { params, responseType: "blob" },
  );
};

export { getYearSeasonOrdersReportDetails, downloadYearSeasonOrdersReportPdf };
export type { YearSeasonOrdersReportQueryParams };
