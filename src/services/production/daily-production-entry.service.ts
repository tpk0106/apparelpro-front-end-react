import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

export interface DailyProductionEntryScope {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  lineCode: string;
}

// Picks exactly the fields this endpoint's [FromQuery] model expects, rather
// than spreading the whole `scope` object into `params` - a caller can (and
// one call site did) pass an object with extra display-only fields
// (buyerName/typeName from the shared StyleScope picker) that happen to
// satisfy this narrower interface structurally; TypeScript's excess-property
// check only fires on a fresh object literal, not on a variable passed
// through, so those extra fields silently rode along into the query string.
const toQueryParams = (scope: DailyProductionEntryScope) => ({
  buyerCode: scope.buyerCode,
  order: scope.order,
  typeCode: scope.typeCode,
  styleCode: scope.styleCode,
  lineCode: scope.lineCode,
});

const loadDailyProductionEntries = async (date: string, scope: DailyProductionEntryScope) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.DAILY_PRODUCTION_ENTRY.GET_BY_DATE, {
    params: { date, ...toQueryParams(scope) },
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
    { params: { date, ...toQueryParams(scope) } },
  );
};

export { loadDailyProductionEntries, bulkSaveDailyProductionEntries };
