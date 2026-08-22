import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  ManualAllocateEstimatedProductionLine,
  AutomaticAllocateEstimatedProductionLine,
} from "../../interfaces/production/EstimatedProductionLineAllocation";

const loadAllocation = async (buyerCode: number, styleCode: string) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ESTIMATED_PRODUCTION_LINE_ALLOCATION.GET, {
    params: { buyerCode, styleCode },
  });
};

const manualAllocate = async (payload: ManualAllocateEstimatedProductionLine) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ESTIMATED_PRODUCTION_LINE_ALLOCATION.MANUAL,
    payload,
  );
};

const automaticAllocate = async (payload: AutomaticAllocateEstimatedProductionLine) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ESTIMATED_PRODUCTION_LINE_ALLOCATION.AUTOMATIC,
    payload,
  );
};

const deleteAllocation = async (buyerCode: number, styleCode: string) => {
  return await client.delete(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ESTIMATED_PRODUCTION_LINE_ALLOCATION.DELETE, {
    params: { buyerCode, styleCode },
  });
};

export { loadAllocation, manualAllocate, automaticAllocate, deleteAllocation };
