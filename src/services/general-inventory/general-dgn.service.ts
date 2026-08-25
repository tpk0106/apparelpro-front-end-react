import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { GeneralInventoryMutationResponse } from "../../interfaces/general-inventory/general-inventory.types";
import type { GeneralDgnSubmissionPayload } from "../../interfaces/general-inventory/general-dgn.types";

const commitGeneralDGN = async (payload: GeneralDgnSubmissionPayload) => {
  return await client.post<GeneralInventoryMutationResponse>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.DGN.COMMIT,
    payload,
  );
};

export { commitGeneralDGN };
