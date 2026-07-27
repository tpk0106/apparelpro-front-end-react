import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type {
  SrnReturnableStockRow,
  SrnSubmissionPayload,
  SrnMutationResponse,
} from "../components/orderwise-inventory/supplier-return-note.types";

const getReturnableStockByBuyerOrder = async (params: {
  buyerCode: number;
  order: string;
}) => {
  return await client.get<SrnReturnableStockRow[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.SRN.RETURNABLE_STOCK,
    { params },
  );
};

const commitSRN = async (payload: SrnSubmissionPayload) => {
  return await client.post<SrnMutationResponse>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.SRN.COMMIT,
    payload,
  );
};

export { getReturnableStockByBuyerOrder, commitSRN };
