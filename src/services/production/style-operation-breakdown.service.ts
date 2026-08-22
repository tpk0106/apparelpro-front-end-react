import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { StyleOperationBreakdown } from "../../interfaces/production/StyleOperationBreakdown";
import type { StyleScope } from "../../components/production/style-scope/style-scope-picker.component";

const loadOperationBreakdownByStyle = async (scope: StyleScope) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.STYLE_OPERATION_BREAKDOWN.GET_BY_STYLE,
    { params: scope },
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
    { params: { ...scope, componentSequence, componentCode } },
  );
};

const bulkSaveOperationBreakdown = async (
  scope: StyleScope,
  records: StyleOperationBreakdown[],
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.STYLE_OPERATION_BREAKDOWN.BULK_SAVE,
    records,
    { params: scope },
  );
};

export {
  loadOperationBreakdownByStyle,
  seedOperationBreakdownFromTemplate,
  bulkSaveOperationBreakdown,
};
