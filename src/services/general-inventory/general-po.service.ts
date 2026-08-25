import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  GeneralPOSubmissionPayload,
  GeneralPoCommitResult,
} from "../../interfaces/general-inventory/general-po.types";

const commitGeneralPO = async (payload: GeneralPOSubmissionPayload) => {
  return await client.post<GeneralPoCommitResult>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.PO.COMMIT,
    payload,
  );
};

const getGeneralPurchaseOrder = async (poNumber: string) => {
  return await client.get<GeneralPOSubmissionPayload>(
    `${APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.PO.GET_BY_NUMBER}/${poNumber}`,
  );
};

export { commitGeneralPO, getGeneralPurchaseOrder };
