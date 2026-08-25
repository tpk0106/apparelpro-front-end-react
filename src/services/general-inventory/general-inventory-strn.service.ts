import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  GeneralStockItemAvailability,
  GeneralRequisitionSubmissionPayload,
  VerifyGeneralStockQueryParams,
  GeneralInventoryMutationResponse,
  GeneralStockLookupRow,
  GeneralStore,
} from "../../interfaces/general-inventory/general-inventory.types";

const verifyStockItemAvailability = async (
  params: VerifyGeneralStockQueryParams,
) => {
  return await client.get<GeneralStockItemAvailability>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.STRN.VERIFY_STOCK,
    { params },
  );
};

const createGeneralSTRN = async (
  payload: GeneralRequisitionSubmissionPayload,
) => {
  return await client.post<GeneralInventoryMutationResponse>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.STRN.POST,
    payload,
  );
};

const getAvailableStockChoices = async (params: { storeCode: string }) => {
  return await client.get<GeneralStockLookupRow[]>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.STRN.AVAILABLE_CHOICES,
    { params },
  );
};

const getStores = async () => {
  return await client.get<GeneralStore[]>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.STRN.STORES,
  );
};

export {
  verifyStockItemAvailability,
  createGeneralSTRN,
  getAvailableStockChoices,
  getStores,
};
