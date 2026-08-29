import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { GeneralInventoryMutationResponse } from "../../interfaces/general-inventory/general-inventory.types";
import type {
  GeneralStockMasterEntryPayload,
  GeneralStockMasterUpdatePayload,
  GeneralStockMasterRow,
} from "../../interfaces/general-inventory/general-stock-master.types";

const commitGeneralStockMaster = async (payload: GeneralStockMasterEntryPayload) => {
  return await client.post<GeneralInventoryMutationResponse>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.STOCK_MASTER.COMMIT,
    payload,
  );
};

const updateGeneralStockMaster = async (payload: GeneralStockMasterUpdatePayload) => {
  return await client.put<GeneralInventoryMutationResponse>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.STOCK_MASTER.UPDATE,
    payload,
  );
};

const getGeneralStockMastersByStore = async (storeCode: string) => {
  return await client.get<GeneralStockMasterRow[]>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.STOCK_MASTER.BY_STORE,
    { params: { storeCode } },
  );
};

const deleteGeneralStockMaster = async (storeCode: string, itemCode: string) => {
  return await client.delete<GeneralInventoryMutationResponse>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.STOCK_MASTER.DELETE,
    { params: { storeCode, itemCode } },
  );
};

export {
  commitGeneralStockMaster,
  updateGeneralStockMaster,
  getGeneralStockMastersByStore,
  deleteGeneralStockMaster,
};
