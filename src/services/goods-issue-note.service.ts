import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type {
  GinStrnLookupResult,
  GinSubmissionPayload,
  GinMutationResponse,
  GinPendingStrn,
} from "../components/orderwise-inventory/goods-issue-note.types";

const getIssuableStrnLines = async (strnNumber: string) => {
  return await client.get<GinStrnLookupResult>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.GIN.ISSUABLE_LINES,
    { params: { strnNumber } },
  );
};

const commitGIN = async (payload: GinSubmissionPayload) => {
  return await client.post<GinMutationResponse>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.GIN.COMMIT,
    payload,
  );
};

const getPendingStrnsByOrder = async (params: { buyerCode: number; order: string }) => {
  return await client.get<GinPendingStrn[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.GIN.PENDING_STRNS,
    { params },
  );
};

export { getIssuableStrnLines, commitGIN, getPendingStrnsByOrder };
