import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { StyleOperationBreakdown } from "../../interfaces/production/StyleOperationBreakdown";
import type { StyleScope } from "../../components/production/style-scope/style-scope-picker.component";

// Picks exactly the fields these endpoints' [FromQuery] models expect,
// rather than passing the whole `scope` object (or spreading it) as `params`
// - StyleScope (the shared picker's output) also carries buyerName/typeName,
// display-only fields these endpoints never declared, which otherwise ride
// along into the query string unnoticed.
const toQueryParams = (scope: StyleScope) => ({
  buyerCode: scope.buyerCode,
  order: scope.order,
  typeCode: scope.typeCode,
  styleCode: scope.styleCode,
});

const loadOperationBreakdownByStyle = async (scope: StyleScope) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.STYLE_OPERATION_BREAKDOWN.GET_BY_STYLE,
    { params: toQueryParams(scope) },
  );
};

const seedOperationBreakdownFromTemplate = async (
  scope: StyleScope,
  componentSequence: number,
  componentCode: string,
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.STYLE_OPERATION_BREAKDOWN.SEED_FROM_TEMPLATE,
    null,
    { params: { ...toQueryParams(scope), componentSequence, componentCode } },
  );
};

const bulkSaveOperationBreakdown = async (
  scope: StyleScope,
  records: StyleOperationBreakdown[],
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.STYLE_OPERATION_BREAKDOWN.BULK_SAVE,
    records,
    { params: toQueryParams(scope) },
  );
};

export {
  loadOperationBreakdownByStyle,
  seedOperationBreakdownFromTemplate,
  bulkSaveOperationBreakdown,
};
