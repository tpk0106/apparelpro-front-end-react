import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { GeneralInventoryMutationResponse } from "../../interfaces/general-inventory/general-inventory.types";
import type { GeneralSanSubmissionPayload } from "../../interfaces/general-inventory/general-san.types";

const commitGeneralSAN = async (payload: GeneralSanSubmissionPayload) => {
  return await client.post<GeneralInventoryMutationResponse>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.SAN.COMMIT,
    payload,
  );
};

export { commitGeneralSAN };
