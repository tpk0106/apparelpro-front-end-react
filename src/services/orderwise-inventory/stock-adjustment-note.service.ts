import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  SanAdjustableStockRow,
  SanSubmissionPayload,
  SanMutationResponse,
} from "../../components/orderwise-inventory/stock-adjustment-note.types";

const getAdjustableStockByBuyerOrder = async (params: {
  buyerCode: number;
  order: string;
}) => {
  return await client.get<SanAdjustableStockRow[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.SAN.ADJUSTABLE_STOCK,
    { params },
  );
};

const commitSAN = async (payload: SanSubmissionPayload) => {
  return await client.post<SanMutationResponse>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.SAN.COMMIT,
    payload,
  );
};

export { getAdjustableStockByBuyerOrder, commitSAN };
