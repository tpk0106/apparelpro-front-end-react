import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  ArnReceivableStockRow,
  ArnSubmissionPayload,
  ArnMutationResponse,
} from "../../components/orderwise-inventory/additional-goods-receipt-note.types";

const getReceivableStockByBuyerOrder = async (params: {
  buyerCode: number;
  order: string;
}) => {
  return await client.get<ArnReceivableStockRow[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.ARN.RECEIVABLE_STOCK,
    { params },
  );
};

const commitARN = async (payload: ArnSubmissionPayload) => {
  return await client.post<ArnMutationResponse>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.ARN.COMMIT,
    payload,
  );
};

export { getReceivableStockByBuyerOrder, commitARN };
