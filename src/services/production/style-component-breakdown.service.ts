import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { StyleComponentBreakdown } from "../../interfaces/production/StyleComponentBreakdown";
import type { StyleScope } from "../../components/production/style-scope/style-scope-picker.component";

const loadComponentBreakdownByStyle = async (scope: StyleScope) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.STYLE_COMPONENT_BREAKDOWN.GET_BY_STYLE,
    { params: scope },
  );
};

const bulkSaveComponentBreakdown = async (
  scope: StyleScope,
  records: StyleComponentBreakdown[],
) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.STYLE_COMPONENT_BREAKDOWN.BULK_SAVE,
    records,
    { params: scope },
  );
};

export { loadComponentBreakdownByStyle, bulkSaveComponentBreakdown };
