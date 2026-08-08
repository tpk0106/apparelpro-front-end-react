import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  DgnDamageableStockRow,
  DgnSubmissionPayload,
  DgnMutationResponse,
} from "../../components/orderwise-inventory/damaged-goods-note.types";

const getDamageableStockByBuyerOrder = async (params: {
  buyerCode: number;
  order: string;
}) => {
  return await client.get<DgnDamageableStockRow[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.DGN.DAMAGEABLE_STOCK,
    { params },
  );
};

const commitDGN = async (payload: DgnSubmissionPayload) => {
  return await client.post<DgnMutationResponse>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.DGN.COMMIT,
    payload,
  );
};

export { getDamageableStockByBuyerOrder, commitDGN };
