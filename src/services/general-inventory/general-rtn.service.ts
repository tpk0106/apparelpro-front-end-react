import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { GeneralInventoryMutationResponse } from "../../interfaces/general-inventory/general-inventory.types";
import type { GeneralRtnSubmissionPayload } from "../../interfaces/general-inventory/general-rtn.types";

const commitGeneralRTN = async (payload: GeneralRtnSubmissionPayload) => {
  return await client.post<GeneralInventoryMutationResponse>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.RTN.COMMIT,
    payload,
  );
};

export { commitGeneralRTN };
