import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";

export interface EstimatedProductionEntryScope {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  lineCode: string;
}

// Picks exactly the fields this endpoint's [FromQuery] model expects, rather
// than passing the whole `scope` object as `params` - a caller can (and one
// call site did) pass an object with extra display-only fields
// (buyerName/typeName from the shared StyleScope picker) that happen to
// satisfy this narrower interface structurally; TypeScript's excess-property
// check only fires on a fresh object literal, not on a variable passed
// through, so those extra fields silently rode along into the query string.
const toQueryParams = (scope: EstimatedProductionEntryScope) => ({
  buyerCode: scope.buyerCode,
  order: scope.order,
  typeCode: scope.typeCode,
  styleCode: scope.styleCode,
  lineCode: scope.lineCode,
});

const loadEstimatedProductionEntries = async (scope: EstimatedProductionEntryScope) => {
  return await client.get(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ESTIMATED_PRODUCTION_ENTRY.GET_BY_LINE, {
    params: toQueryParams(scope),
  });
};

const bulkSaveEstimatedProductionEntries = async (
  scope: EstimatedProductionEntryScope,
  records: { date: string; unit: string; quantity: number }[],
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.ESTIMATED_PRODUCTION_ENTRY.BULK_SAVE,
    records,
    { params: toQueryParams(scope) },
  );
};

export { loadEstimatedProductionEntries, bulkSaveEstimatedProductionEntries };
