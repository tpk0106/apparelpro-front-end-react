import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { GeneralInventoryMutationResponse } from "../../interfaces/general-inventory/general-inventory.types";
import type { GeneralSrtnSubmissionPayload } from "../../interfaces/general-inventory/general-srtn.types";

const commitGeneralSRTN = async (payload: GeneralSrtnSubmissionPayload) => {
  return await client.post<GeneralInventoryMutationResponse>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.SRTN.COMMIT,
    payload,
  );
};

export { commitGeneralSRTN };
