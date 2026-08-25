import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { GeneralInventoryMutationResponse } from "../../interfaces/general-inventory/general-inventory.types";
import type {
  OrderGtnSubmissionPayload,
  OrderGtnTransferableStockRow,
  OrderGtnDirectionType,
} from "../../interfaces/general-inventory/general-ogtn.types";

const getTransferableStock = async (params: {
  direction: OrderGtnDirectionType;
  storeCode: string;
  buyerCode: number;
  order: string;
}) => {
  return await client.get<OrderGtnTransferableStockRow[]>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.OGTN.TRANSFERABLE_STOCK,
    { params },
  );
};

const commitOrderGTN = async (payload: OrderGtnSubmissionPayload) => {
  return await client.post<GeneralInventoryMutationResponse>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.OGTN.COMMIT,
    payload,
  );
};

export { getTransferableStock, commitOrderGTN };
