import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

const loadCurrentStyle = async () => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DASHBOARD.CURRENT_STYLE);
};

const loadProductionProgress = async (
  buyerCode: number,
  order: string,
  typeCode: number,
  styleCode: string,
) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DASHBOARD.PRODUCTION_PROGRESS, {
    params: { buyerCode, order, typeCode, styleCode },
  });
};

const loadDailyTrend = async (
  buyerCode: number,
  order: string,
  typeCode: number,
  styleCode: string,
) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DASHBOARD.DAILY_TREND, {
    params: { buyerCode, order, typeCode, styleCode },
  });
};

const loadDailyTrendAllSections = async (
  buyerCode: number,
  order: string,
  typeCode: number,
  styleCode: string,
) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DASHBOARD.DAILY_TREND_ALL_SECTIONS, {
    params: { buyerCode, order, typeCode, styleCode },
  });
};

const loadOrderManagementSummary = async (
  buyerCode: number,
  order: string,
  typeCode: number,
  styleCode: string,
) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DASHBOARD.ORDER_MANAGEMENT_SUMMARY, {
    params: { buyerCode, order, typeCode, styleCode },
  });
};

const loadOrderwiseInventorySummary = async (buyerCode: number, order: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DASHBOARD.ORDERWISE_INVENTORY_SUMMARY, {
    params: { buyerCode, order },
  });
};

export {
  loadCurrentStyle,
  loadProductionProgress,
  loadDailyTrend,
  loadDailyTrendAllSections,
  loadOrderManagementSummary,
  loadOrderwiseInventorySummary,
};
