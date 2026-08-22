import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

export interface DailyProductionEntryScope {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  lineCode: string;
}

const loadDailyProductionEntries = async (date: string, scope: DailyProductionEntryScope) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DAILY_PRODUCTION_ENTRY.GET_BY_DATE, {
    params: { date, ...scope },
  });
};

const bulkSaveDailyProductionEntries = async (
  date: string,
  scope: DailyProductionEntryScope,
  records: { sectionCode: string; hours: number; unit: string; quantity: number }[],
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DAILY_PRODUCTION_ENTRY.BULK_SAVE,
    records,
    { params: { date, ...scope } },
  );
};

export { loadDailyProductionEntries, bulkSaveDailyProductionEntries };
