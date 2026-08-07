import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type {
  ApproveTrimSheetPayload,
  ApproveTrimSheetResult,
  StyleApprovalDetails,
  TrimSheetApprovalScopeContext,
} from "../components/trim-sheet-approval/trim-sheet-approval.types";

// GET api/style-approval/details - returns null (200 OK) when the style has
// not yet been Trim-Sheet-approved; this is a normal state, not an error.
const loadStyleApprovalDetails = async (
  scope: TrimSheetApprovalScopeContext,
) => {
  return await client.get<StyleApprovalDetails | null>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.STYLE_APPROVAL.GET_DETAILS,
    { params: scope },
  );
};

// POST api/style-approval/approve-trim-sheet
const approveTrimSheet = async (payload: ApproveTrimSheetPayload) => {
  return await client.post<ApproveTrimSheetResult>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.STYLE_APPROVAL.APPROVE_TRIM_SHEET,
    payload,
  );
};

export { loadStyleApprovalDetails, approveTrimSheet };
