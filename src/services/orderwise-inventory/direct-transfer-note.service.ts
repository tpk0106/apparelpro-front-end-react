import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  DtnFromStockRow,
  DtnToItem,
  DtnSubmissionPayload,
  DtnMutationResponse,
} from "../../components/orderwise-inventory/direct-transfer-note.types";

const getFromStock = async (params: {
  fromBuyerCode: number;
  fromOrder: string;
  toBuyerCode: number;
  toOrder: string;
}) => {
  return await client.get<DtnFromStockRow[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.DTN.FROM_STOCK,
    { params },
  );
};

const getToOrderItems = async (params: {
  toBuyerCode: number;
  toOrder: string;
}) => {
  return await client.get<DtnToItem[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.DTN.TO_ORDER_ITEMS,
    { params },
  );
};

const commitDTN = async (payload: DtnSubmissionPayload) => {
  return await client.post<DtnMutationResponse>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.DTN.COMMIT,
    payload,
  );
};

export { getFromStock, getToOrderItems, commitDTN };
