import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  GeneralGrnPoLookupResult,
  GeneralGrnSubmissionPayload,
  GeneralGrnMutationResponse,
} from "../../interfaces/general-inventory/general-grn.types";

const getReceivableLinesByPo = async (poNumber: string) => {
  return await client.get<GeneralGrnPoLookupResult>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.GRN.RECEIVABLE_LINES,
    { params: { poNumber } },
  );
};

const commitGeneralGrn = async (payload: GeneralGrnSubmissionPayload) => {
  return await client.post<GeneralGrnMutationResponse>(
    APPARELPRO_ENDPOINTS.GENERAL_INVENTORY.GRN.COMMIT,
    payload,
  );
};

export { getReceivableLinesByPo, commitGeneralGrn };
