import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  GeneralGinStrnLookupResult,
  GeneralGinSubmissionPayload,
  GeneralGinMutationResponse,
} from "../../interfaces/general-inventory/general-gin.types";

const getIssuableStrnLines = async (strnNumber: string) => {
  return await client.get<GeneralGinStrnLookupResult>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.GIN.ISSUABLE_LINES,
    { params: { strnNumber } },
  );
};

const commitGeneralGin = async (payload: GeneralGinSubmissionPayload) => {
  return await client.post<GeneralGinMutationResponse>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.GIN.COMMIT,
    payload,
  );
};

export { getIssuableStrnLines, commitGeneralGin };
