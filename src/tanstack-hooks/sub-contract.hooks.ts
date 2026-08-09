import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { toast } from "react-toastify";
import type { AppError } from "../auth/axiosClient";
import {
  loadSubContracts,
  saveSubContract,
  deleteSubContract,
  type SubContractScopeParams,
} from "../services/order-management/sub-contract.service";
import type {
  SubContractRow,
  SaveSubContractPayload,
  SaveSubContractResult,
} from "../components/sub-contract/sub-contract.types";

const queryKeyFor = (params: SubContractScopeParams) => [
  "subContracts",
  params.buyerCode,
  params.order,
  params.typeCode,
  params.styleCode,
];

export const useGetSubContracts = (
  params: SubContractScopeParams,
  enabled: boolean,
): UseQueryResult<SubContractRow[], AppError> => {
  return useQuery<SubContractRow[], AppError>({
    queryKey: queryKeyFor(params),
    queryFn: async () => {
      const response: AxiosResponse<SubContractRow[]> =
        await loadSubContracts(params);
      return response.data;
    },
    enabled,
  });
};

export const useSaveSubContractMutation = (): UseMutationResult<
  SaveSubContractResult,
  AppError,
  SaveSubContractPayload
> => {
  const queryClient = useQueryClient();

  return useMutation<SaveSubContractResult, AppError, SaveSubContractPayload>({
    mutationFn: async (payload) => {
      const response: AxiosResponse<SaveSubContractResult> =
        await saveSubContract(payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeyFor(variables),
      });
      // Success toast fires only when there's no advisory warning, so the
      // toast and the persistent inline warning Alert never double-fire.
      if (!data.quantityWarning) {
        toast.success("Sub Contract entry saved successfully");
      }
    },
    onError: (error) => {
      toast.error(`Save failed: ${error.message}`);
    },
  });
};

export const useDeleteSubContractMutation = (): UseMutationResult<
  boolean,
  AppError,
  SubContractScopeParams & { subContractorCode: string }
> => {
  const queryClient = useQueryClient();

  return useMutation<
    boolean,
    AppError,
    SubContractScopeParams & { subContractorCode: string }
  >({
    mutationFn: async (params) => {
      const response: AxiosResponse<boolean> = await deleteSubContract(params);
      return response.data;
    },
    onSuccess: (success, variables) => {
      if (!success) {
        toast.error("Unable to delete this Sub Contract entry.");
        return;
      }
      queryClient.invalidateQueries({
        queryKey: queryKeyFor(variables),
      });
      toast.success("Sub Contract entry deleted successfully");
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });
};
