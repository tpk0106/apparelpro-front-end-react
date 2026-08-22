import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

export interface EstimatedProductionEntryScope {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  lineCode: string;
}

const loadEstimatedProductionEntries = async (scope: EstimatedProductionEntryScope) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ESTIMATED_PRODUCTION_ENTRY.GET_BY_LINE, {
    params: scope,
  });
};

const bulkSaveEstimatedProductionEntries = async (
  scope: EstimatedProductionEntryScope,
  records: { date: string; unit: string; quantity: number }[],
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ESTIMATED_PRODUCTION_ENTRY.BULK_SAVE,
    records,
    { params: scope },
  );
};

export { loadEstimatedProductionEntries, bulkSaveEstimatedProductionEntries };
