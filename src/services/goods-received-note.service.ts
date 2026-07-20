import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type {
  GrnPoLookupResult,
  GrnSubmissionPayload,
  GrnMutationResponse,
  GrnPendingPo,
} from "../components/orderwise-inventory/goods-received-note.types";

const getReceivableLinesByPo = async (poNumber: string) => {
  return await client.get<GrnPoLookupResult>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.GRN.RECEIVABLE_LINES,
    { params: { poNumber } },
  );
};

const commitGRN = async (payload: GrnSubmissionPayload) => {
  return await client.post<GrnMutationResponse>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.GRN.COMMIT,
    payload,
  );
};

const getPendingPosByOrder = async (params: { buyerCode: number; order: string }) => {
  return await client.get<GrnPendingPo[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.GRN.PENDING_POS,
    { params },
  );
};

export { getReceivableLinesByPo, commitGRN, getPendingPosByOrder };
