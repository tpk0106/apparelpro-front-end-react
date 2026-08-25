import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { GeneralInventoryMutationResponse } from "../../interfaces/general-inventory/general-inventory.types";
import type { GeneralGtnSubmissionPayload } from "../../interfaces/general-inventory/general-gtn.types";

const commitGeneralGTN = async (payload: GeneralGtnSubmissionPayload) => {
  return await client.post<GeneralInventoryMutationResponse>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.GTN.COMMIT,
    payload,
  );
};

export { commitGeneralGTN };
