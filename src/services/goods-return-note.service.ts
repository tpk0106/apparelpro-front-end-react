import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type {
  RtnReturnableStockRow,
  RtnSubmissionPayload,
  RtnMutationResponse,
} from "../components/orderwise-inventory/goods-return-note.types";

const getReturnableStockByBuyerOrder = async (params: {
  buyerCode: number;
  order: string;
}) => {
  return await client.get<RtnReturnableStockRow[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.RTN.RETURNABLE_STOCK,
    { params },
  );
};

const commitRTN = async (payload: RtnSubmissionPayload) => {
  return await client.post<RtnMutationResponse>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.RTN.COMMIT,
    payload,
  );
};

export { getReturnableStockByBuyerOrder, commitRTN };
