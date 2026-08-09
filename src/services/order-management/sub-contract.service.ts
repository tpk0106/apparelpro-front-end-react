import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  SubContractRow,
  SaveSubContractPayload,
  SaveSubContractResult,
} from "../../components/sub-contract/sub-contract.types";

interface SubContractScopeParams {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
}

const loadSubContracts = async (params: SubContractScopeParams) => {
  return await client.get<SubContractRow[]>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.SUB_CONTRACT.GET_BY_STYLE,
    { params },
  );
};

const saveSubContract = async (payload: SaveSubContractPayload) => {
  return await client.post<SaveSubContractResult>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.SUB_CONTRACT.SAVE_ENTRY,
    payload,
  );
};

const deleteSubContract = async (
  params: SubContractScopeParams & { subContractorCode: string },
) => {
  return await client.delete<boolean>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.SUB_CONTRACT.DELETE_ENTRY,
    { params },
  );
};

export { loadSubContracts, saveSubContract, deleteSubContract };
export type { SubContractScopeParams };
