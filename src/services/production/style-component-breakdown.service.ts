import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { StyleComponentBreakdown } from "../../interfaces/production/StyleComponentBreakdown";
import type { StyleScope } from "../../components/production/style-scope/style-scope-picker.component";

// Picks exactly the fields these endpoints' [FromQuery] models expect,
// rather than passing the whole `scope` object as `params` - StyleScope (the
// shared picker's output) also carries buyerName/typeName, display-only
// fields these endpoints never declared, which otherwise ride along into the
// query string unnoticed.
const toQueryParams = (scope: StyleScope) => ({
  buyerCode: scope.buyerCode,
  order: scope.order,
  typeCode: scope.typeCode,
  styleCode: scope.styleCode,
});

const loadComponentBreakdownByStyle = async (scope: StyleScope) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.STYLE_COMPONENT_BREAKDOWN.GET_BY_STYLE,
    { params: toQueryParams(scope) },
  );
};

const bulkSaveComponentBreakdown = async (
  scope: StyleScope,
  records: StyleComponentBreakdown[],
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.STYLE_COMPONENT_BREAKDOWN.BULK_SAVE,
    records,
    { params: toQueryParams(scope) },
  );
};

export { loadComponentBreakdownByStyle, bulkSaveComponentBreakdown };
