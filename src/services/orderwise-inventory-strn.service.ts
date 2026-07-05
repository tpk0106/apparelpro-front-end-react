import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type {
  StockItemAvailabilityDetails,
  RequisitionSubmissionPayload,
  VerifyStockQueryParams,
  InventoryMutationResponse,
  StockLookupRow,
} from "../components/orderwise-inventory/orderwise-inventory.types";

const verifyStockItemAvailability = async (params: VerifyStockQueryParams) => {
  return await client.get<StockItemAvailabilityDetails>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STRN.VERIFY_STOCK,
    { params },
  );
};

const createSTRN = async (payload: RequisitionSubmissionPayload) => {
  return await client.post<InventoryMutationResponse>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STRN.POST,
    payload,
  );
};

const getAvailableStockChoices = async (params: {
  buyerCode: number;
  order: string;
  storeCode: string;
}) => {
  return await client.get<StockLookupRow[]>(
    APPARELPRO_ENDPOINTS.ORDER_WISE_INVENTORY.STRN.AVAILABLE_CHOICES,
    { params },
  );
};

export { verifyStockItemAvailability, createSTRN, getAvailableStockChoices };
