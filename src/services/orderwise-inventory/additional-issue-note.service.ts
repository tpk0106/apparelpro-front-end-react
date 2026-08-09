import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  AinIssuableStockRow,
  AinSubmissionPayload,
  AinMutationResponse,
} from "../../components/orderwise-inventory/additional-issue-note.types";

const getIssuableStockByBuyerOrder = async (params: {
  buyerCode: number;
  order: string;
}) => {
  return await client.get<AinIssuableStockRow[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.AIN.ISSUABLE_STOCK,
    { params },
  );
};

const commitAIN = async (payload: AinSubmissionPayload) => {
  return await client.post<AinMutationResponse>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.AIN.COMMIT,
    payload,
  );
};

export { getIssuableStockByBuyerOrder, commitAIN };
