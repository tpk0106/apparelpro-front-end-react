import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type {
  GtnTransferableStockRow,
  GtnSubmissionPayload,
  GtnMutationResponse,
} from "../components/orderwise-inventory/goods-transfer-note.types";

const getTransferableStock = async (params: {
  fromBuyerCode: number;
  fromOrder: string;
  toBuyerCode: number;
  toOrder: string;
}) => {
  return await client.get<GtnTransferableStockRow[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.GTN.TRANSFERABLE_STOCK,
    { params },
  );
};

const commitGTN = async (payload: GtnSubmissionPayload) => {
  return await client.post<GtnMutationResponse>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.GTN.COMMIT,
    payload,
  );
};

export { getTransferableStock, commitGTN };
